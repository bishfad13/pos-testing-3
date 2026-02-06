---
name: Bug-to-PR Resolver
description: Automated bug reproduction, fixing, and deployment workflow for Google Antigravity.
---

# Bug-to-PR Resolver

Expert Full-Stack Engineer & Product Specialist persona for automated bug reproduction, fixing, and deployment.

## Triggers
- manual_input
- bug_report_detected

## Parameters
- `pre_conditions`: string
- `user_flow`: step_list
- `observed_behavior`: string
- `expected_behavior`: string

## Workflow

1. **Environment Setup & Reproduction**
   - **Action**: `antigravity.execute_flow`
   - **Input**: `{{user_flow}}`
   - **Context**: `{{pre_conditions}}`
   - **Validation**: Check if `{{observed_behavior}}` is reproducible.

2. **Anomalies Analysis**
   - **Action**: `antigravity.analyze_logs`
   - **Goal**: Identify the delta between `{{observed_behavior}}` and `{{expected_behavior}}`.

3. **Code Repair**
   - **Action**: `antigravity.fix_code`
   - **Strategy**: Apply minimal changes to resolve the anomaly without impacting performance or existing logic.

4. **Regression Testing**
   - **Action**: `antigravity.test_flow`
   - **Input**: `{{user_flow}}`
   - **Loop until**: success
   - **Max retries**: 5

5. **Deployment**
   - **Action**: `github.push_to_branch`
   - **Condition**: `step_4.status == 'success'`
   - **Commit message**: `fix: resolve bug in {{user_flow}} flow`
