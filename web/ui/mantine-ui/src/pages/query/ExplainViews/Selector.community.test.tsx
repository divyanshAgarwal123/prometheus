// Copyright The Prometheus Authors

import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useSuspenseAPIQuery } from "../../../api/api";
import { matchType, nodeType, VectorSelector } from "../../../promql/ast";
import SelectorExplainView from "./Selector";

vi.mock("../../../api/api", () => ({ useSuspenseAPIQuery: vi.fn() }));
vi.mock("../../../state/settingsSlice", () => ({
  useSettings: () => ({ lookbackDelta: "5m" }),
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.mocked(useSuspenseAPIQuery).mockImplementation(
    ({ params }) =>
      ({
        data: {
          data:
            typeof params !== "function" &&
            params?.metric === "service.requests"
              ? {
                  "service.requests": [
                    {
                      type: "counter",
                      help: "Base metric metadata.",
                      unit: "",
                    },
                  ],
                }
              : {},
        },
      }) as never,
  );
});

const selector: VectorSelector = {
  type: nodeType.vectorSelector,
  name: "",
  matchers: [],
  offset: 0,
  offsetExpr: null,
  timestamp: null,
  startOrEnd: null,
  anchored: false,
  smoothed: false,
};

it.each([matchType.notEqual, matchType.matchRegexp, matchType.matchNotRegexp])(
  "retains a %s matcher on __name__",
  (type) => {
    render(
      <MantineProvider env="test">
        <SelectorExplainView
          node={{
            ...selector,
            matchers: [{ name: "__name__", type, value: "service_.*" }],
          }}
        />
      </MantineProvider>,
    );
    expect(screen.getAllByText('"service_.*"')).toHaveLength(2);
  },
);

it("uses base-metric metadata for an in-brace range selector", () => {
  render(
    <MantineProvider env="test">
      <SelectorExplainView
        node={{
          ...selector,
          type: nodeType.matrixSelector,
          range: 300000,
          rangeExpr: null,
          matchers: [
            {
              name: "__name__",
              type: matchType.equal,
              value: "service.requests_total",
            },
          ],
        }}
      />
    </MantineProvider>,
  );
  expect(useSuspenseAPIQuery).toHaveBeenCalledWith({
    path: "/metadata",
    params: { metric: "service.requests_total" },
  });
  expect(useSuspenseAPIQuery).toHaveBeenCalledWith({
    path: "/metadata",
    params: { metric: "service.requests" },
  });
  expect(screen.getByText("service.requests_total")).toBeInTheDocument();
  expect(screen.getByText(/Base metric metadata\./)).toBeInTheDocument();
  expect(screen.getByText("Range vector selector")).toBeInTheDocument();
});
