// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Unit Tests: Model Selector
// ═══════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { selectModel, getModelCost, MODELS } from "@/lib/utils/model-selector";
import type { AgentTask, AgentSession } from "@/lib/types";

function createMockTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    task_id: "test-task",
    type: "plan_trip",
    payload: {},
    context: {} as AgentSession,
    user_id: "user-1",
    session_id: "session-1",
    complexity: "medium",
    requiresVision: false,
    latencyBudgetMs: 5000,
    ...overrides,
  };
}

describe("selectModel", () => {
  it("should return GPT-4o for vision tasks", () => {
    const task = createMockTask({ requiresVision: true });
    expect(selectModel(task)).toBe(MODELS.GPT4O);
  });

  it("should return GPT-4o-mini for low complexity", () => {
    const task = createMockTask({ complexity: "low" });
    expect(selectModel(task)).toBe(MODELS.GPT4O_MINI);
  });

  it("should return GPT-4o for high complexity", () => {
    const task = createMockTask({ complexity: "high" });
    expect(selectModel(task)).toBe(MODELS.GPT4O);
  });

  it("should return GPT-4o-mini for tight latency budget", () => {
    const task = createMockTask({ latencyBudgetMs: 1000 });
    expect(selectModel(task)).toBe(MODELS.GPT4O_MINI);
  });

  it("should return GPT-4o as default for medium complexity", () => {
    const task = createMockTask({
      complexity: "medium",
      latencyBudgetMs: 5000,
    });
    expect(selectModel(task)).toBe(MODELS.GPT4O);
  });

  it("should return GPT-4o-mini for low-complexity intent types", () => {
    const task = createMockTask({ type: "convert_currency" });
    expect(selectModel(task)).toBe(MODELS.GPT4O_MINI);
  });
});

describe("getModelCost", () => {
  it("should return correct costs for GPT-4o", () => {
    const cost = getModelCost(MODELS.GPT4O);
    expect(cost.input).toBe(0.005);
    expect(cost.output).toBe(0.015);
  });

  it("should return correct costs for GPT-4o-mini", () => {
    const cost = getModelCost(MODELS.GPT4O_MINI);
    expect(cost.input).toBe(0.00015);
    expect(cost.output).toBe(0.0006);
  });

  it("should return default costs for unknown model", () => {
    const cost = getModelCost("unknown-model");
    expect(cost.input).toBeGreaterThan(0);
  });
});
