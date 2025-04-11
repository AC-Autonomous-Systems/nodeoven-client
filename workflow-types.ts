import { z } from 'zod';
export const WORKFLOW_STEP_OUTPUT_FORMATS = [
  'string',
  'number',
  'boolean',
  'array',
] as const;
export const WORKFLOW_PERMISSIONS = ['owner', 'editor', 'viewer'] as const;
export const WORKFLOW_STEP_CODE_EXECUTION_LANGUAGES = ['python'] as const;
export const WORKFLOW_STEP_LINK_CONDITIONS = [
  'equals',
  'not_equals',
  'greater_than', // Only for numbers.
  'less_than', // Only for numbers.
  'greater_than_or_equals', // Only for numbers.
  'less_than_or_equals', // Only for numbers.
] as const;
export const WORKFLOW_RUN_STATUSES = [
  'draft',
  'running',
  'finished',
  'failed',
] as const;
export const WORKFLOW_STEP_RUN_STATUSES = [
  'waiting',
  'running',
  'finished',
  'skipped',
  'failed',
] as const;

export type SourceLocation = {
  content: string;
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
};
export type Workflow = {
  id: string;
  name: string;
  tenantId: string | null;
  description: string | null;
  createdAt: Date;
};

export type WorkflowStep = {
  id: string;
  name: string;
  description: string | null;
  workflowId: string;
  acceptDocuments: boolean;
  createdAt: Date | string;
  iterateThroughInputs: boolean;
  passthroughDocuments: boolean;
};

export type WorkflowStepQuestion = {
  id: string;
  workflowStepId: string;
  llmPrompt: string;
  outputFormat: (typeof WORKFLOW_STEP_OUTPUT_FORMATS)[number];
  uniqueIdenfier: string | null;
  requiresPythonScriptExecution: boolean;
  tenantLLMEndpointToUseId: string | null;
};

export type WorkflowStepLink = {
  id: string;
  workflowId: string;
  fromStepId: string;
  toStepId: string;
};

export type WorkflowStepLinkCondition = {
  id: string;
  workflowStepLinkId: string;
  workflowStepOutputQuestionId: string;
  workflowStepLinkConditionType: (typeof WORKFLOW_STEP_LINK_CONDITIONS)[number];
  condition: string;
};

export type WorkflowStepIterateWithParentDependency = {
  id: string;
  workflowStepId: string;
  iterateWithParentStepId: string;
};

export type WorkflowStepPassthroughDocumentDependency = {
  id: string;
  workflowStepId: string;
  passthroughFromParentStepId: string;
};

export type WorkflowRun = {
  id: string;
  status: (typeof WORKFLOW_RUN_STATUSES)[number];
  createdAt: Date;
  workflowId: string;
  finishedAt: Date | null;
  manualReviewed: boolean;
  name: string | null;
};

export type WorkflowRunStepQuestionOutput = {
  /* -------------------------------- Metatdata ------------------------------- */
  id: string;
  status: (typeof WORKFLOW_STEP_RUN_STATUSES)[number];
  workflowRunId: string;
  workflowStepQuestionId: string;
  extraInformation: string | null;
  iterateThroughDocumentsDocumentId: string | null;
  iterateWithParentDocumentId: string | null;
  requiresPythonScriptExecution: boolean;
  tenantLLMEndpointUsedId: string | null;
  /* --------------------------------- Outputs -------------------------------- */
  generatedCode: string | null;
  result: string;
  resultInJson: any | null;
  error: string | null;
  manualReviewed: boolean;
  reviewedResult: string | null;
};

export type WorkflowRunStepQuestionOutputDocumentUsed = {
  id: string;
  documentUsedId: string;
  workflowRunStepQuestionOutputId: string;
};

export type WorkflowRunStepQuestionOutputDocumentUsedLocation = {
  id: string;
  workflowRunStepQuestionOutputDocumentUsedId: string;
  pageNumber: number | null;
  xCordMin: number | null;
  xCordMax: number | null;
  yCordMin: number | null;
  yCordMax: number | null;
};

export type WorkflowRunStepQuestionOutputParentDocumentUsed = {
  id: string;
  parentDocumentUsedId: string;
  workflowRunStepQuestionOutputId: string;
};

export type WorkflowRunStepQuestionOutputParentDocumentUsedLocation = {
  id: string;
  workflowRunStepQuestionOutputParentDocumentUsedId: string;
  pageNumber: number | null;
  xCordMin: number | null;
  xCordMax: number | null;
  yCordMin: number | null;
  yCordMax: number | null;
};
export type WorkflowRunDraftInput = {
  id: string;
  workflowRunId: string;
  workflowStepId: string;
  extraInformation: string | null;
  createdAt: Date;
};

export type WorkflowRunDraftInputDocumentUsed = {
  id: string;
  workflowRunDraftInputId: string;
  documentUsedId: string;
};

/* -------------------------------------------------------------------------- */
/*                                 Input Types                                */
/* -------------------------------------------------------------------------- */
export const zCreateWorkflowInput = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long' }),
  description: z.string().optional(),
  tenantId: z.string().uuid(),
  folderId: z.string().uuid().optional(),
});

export const zCreateWorkflowStepInput = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name must be at least 1 character long' }),
    description: z.string().optional(),
    acceptDocuments: z.boolean().optional(),
    iterateThroughInputs: z.boolean().optional(),
    passthroughDocuments: z.boolean().optional(),
  })
  .refine(
    (data) => {
      return data.iterateThroughInputs === true && data.acceptDocuments !== true
        ? false
        : true;
    },
    {
      message:
        'You must accept documents if you want to iterate through inputs',
      path: ['iterateThroughInputs'],
    }
  )
  .refine(
    (data) => {
      return data.passthroughDocuments === true && data.acceptDocuments !== true
        ? false
        : true;
    },
    {
      message: 'You must accept documents if you want to passthrough documents',
      path: ['passthroughDocuments'],
    }
  );

export const zCreateWorkflowStepQuestionInput = z.object({
  llmPrompt: z
    .string()
    .min(1, { message: 'LLM Prompt must be at least 1 character long' }),
  outputFormat: z.enum(WORKFLOW_STEP_OUTPUT_FORMATS),
  uniqueIdenfier: z.string().optional(),
  requiresPythonScriptExecution: z.boolean().default(false),
  tenantLLMEndpointToUseId: z.string().uuid().nullable().optional(),
});

export const zCreateWorkflowStepLinkInput = z.object({
  fromStepId: z.string().uuid(),
  toStepId: z.string().uuid(),
});

export const zCreateWorkflowStepLinkConditionInput = z.object({
  workflowStepOutputQuestionId: z.string().uuid(),
  workflowStepLinkConditionType: z.enum(WORKFLOW_STEP_LINK_CONDITIONS),
  condition: z.string(),
});

export const zCreateWorkflowIterateWithParentDependenciesInput = z.object({
  childStepId: z.string().uuid(),
});

export const zCreateWorkflowStepPassthroughDocumentDependenciesInput = z.object(
  {
    childStepId: z.string().uuid(),
  }
);

export const zUpdateWorkflowInput = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name must be at least 1 character long' })
      .optional(),
    description: z.string().optional(),
    folderId: z.string().uuid().optional(),
    tenantId: z.string().uuid().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.folderId !== undefined ||
      data.tenantId !== undefined,
    {
      message: 'You must specify a field to update.',
    }
  );

export const zUpdateWorkflowStepInput = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name must be at least 1 character long' })
      .optional(),
    description: z.string().optional(),
    acceptDocuments: z.boolean().optional(),
    iterateThroughInputs: z.boolean().optional(),
    passthroughDocuments: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.acceptDocuments !== undefined ||
      data.iterateThroughInputs !== undefined ||
      data.passthroughDocuments !== undefined,
    {
      message: 'You must specify a field to update.',
    }
  )
  .refine(
    (data) => {
      return data.iterateThroughInputs === true && data.acceptDocuments !== true
        ? false
        : true;
    },
    {
      message:
        'You must accept documents if you want to iterate through inputs',
      path: ['iterateThroughInputs'],
    }
  );

export const zUpdateWorkflowStepQuestionInput = z.object({
  llmPrompt: z
    .string()
    .min(1, { message: 'LLM Prompt must be at least 1 character long' }),
  outputFormat: z.enum(WORKFLOW_STEP_OUTPUT_FORMATS),
  uniqueIdenfier: z.string().optional(),
  requiresPythonScriptExecution: z.boolean().optional(),
  tenantLLMEndpointToUseId: z.string().uuid().nullable().optional(),
});

export const zUpdateWorkflowStepLinkConditionInput = z
  .object({
    workflowStepLinkConditionType: z
      .enum(WORKFLOW_STEP_LINK_CONDITIONS)
      .optional(),
    condition: z.string().optional(),
  })
  .refine(
    (data) =>
      data.workflowStepLinkConditionType !== undefined ||
      data.condition !== undefined,
    {
      message: 'You must specify a field to update.',
    }
  );

export const zRunWorkflowInput = z.object({
  name: z.string().optional(),
  workflowStepRunInputDataEntries: z.array(
    z.object({
      workflowStepId: z.string().uuid(),
      extraInformation: z.string().optional().nullable(),
      documentIds: z.array(z.string().uuid()),
    })
  ),
  isDraft: z.boolean().optional(),
});

export const zReviewWorkflowRunStepQuestionOutputInput = z.object({
  manualReviewed: z.boolean(),
  reviewedResult: z.string(),
});

export const zUpdateWorkflowRunDraftInputByStepIdInput = z
  .object({
    documentIds: z.array(z.string().uuid()),
    extraInformation: z.string().optional().nullable(),
  })
  .refine(
    (data) =>
      data.documentIds !== undefined || data.extraInformation !== undefined,
    {
      message: 'You must specify a field to update.',
    }
  );

// For re-running a step question output (aka rerun a question):
export const zRerunWorkflowRunStepQuestionOutputInput = z.object({
  rerunAllDescendants: z.boolean(),
});
/* -------------------------------------------------------------------------- */
/*                                Output Types                                */
/* -------------------------------------------------------------------------- */
export type CreateWorkflowSuccessOutput = {
  createdWorkflow: Workflow;
};

export type CreateWorkflowStepSuccessOutput = {
  createdWorkflowStep: WorkflowStep;
};

export type CreateWorkflowStepQuestionSuccessOutput = {
  createdWorkflowStepQuestion: WorkflowStepQuestion;
};

export type CreateWorkflowStepLinkSuccessOutput = {
  createdWorkflowStepLink: WorkflowStepLink;
};

export type CreateWorkflowStepLinkConditionSuccessOutput = {
  createdWorkflowStepLinkCondition: WorkflowStepLinkCondition;
};

export type CreateWorkflowRunSuccessOutput = {
  createdWorkflowRun: WorkflowRun;
};

export type CreateWorkflowRunOutput =
  | CreateWorkflowRunSuccessOutput
  | {
      error: string;
    };

export type CreateWorkflowStepIterateWithParentDependenciesSuccessOutput = {
  createdWorkflwoStepIterateWithParentDependencies: WorkflowStepIterateWithParentDependency[];
};
export type CreateWorkflowStepIterateWithParentDependenciesOutput =
  | CreateWorkflowStepIterateWithParentDependenciesSuccessOutput
  | { error: string };

export type CreateWorkflowStepPassthroughDocumentDependenciesSuccessOutput = {
  createdWorkflowStepPassthroughDocumentDependencies: WorkflowStepPassthroughDocumentDependency[];
};

export type CreateWorkflowStepPassthroughDocumentDependenciesOutput =
  | CreateWorkflowStepPassthroughDocumentDependenciesSuccessOutput
  | { error: string };

export type UpdateWorkflowSuccessOutput = {
  updatedWorkflow: Workflow;
};

export type UpdateWorkflowStepSuccessOutput = {
  updatedWorkflowStep: WorkflowStep;
};

export type UpdateWorkflowStepQuestionSuccessOutput = {
  updatedWorkflowStepQuestion: WorkflowStepQuestion;
};

export type UpdateWorkflowStepLinkConditionSuccessOutput = {
  updatedWorkflowStepLinkCondition: WorkflowStepLinkCondition;
};

export type GetWorkflowByIdSuccessfulResponse = {
  workflow: Workflow;
  workflowSteps: (WorkflowStep & {
    linkId: string | null;
    fromStepId: string;
    toStepId: string | null;
  })[];
  workflowStepQuestions: WorkflowStepQuestion[];
  workflowStepLinks: {
    linkId: string | null;
    fromStepId: string;
    toStepId: string | null;
  }[];
  workflowStepLinkConditions: WorkflowStepLinkCondition[];
  workflowStepIterateWithParentDependencies: WorkflowStepIterateWithParentDependency[];
  workflowStepPassthroughDocumentDependencies: WorkflowStepPassthroughDocumentDependency[];
};

export type GetWorkflowByIdResponse =
  | GetWorkflowByIdSuccessfulResponse
  | {
      error: string;
    };

export type GetWorkflowStepLinkConditionsByLinkIdSuccessfulResponse = {
  workflowStepLinkConditions: WorkflowStepLinkCondition[];
};

export type GetWorkflowStepLinkConditionsByLinkIdResponse =
  | GetWorkflowStepLinkConditionsByLinkIdSuccessfulResponse
  | {
      error: string;
    };

export type GetWorkflowRunsByWorkflowIdSuccessfulResponse = {
  workflowRuns: WorkflowRun[];
  workflowRunsQuestionOutputs: WorkflowRunStepQuestionOutput[];
  workflowStepQuestions: WorkflowStepQuestion[];
};

export type GetWorkflowRunsByWorkflowIdResponse =
  | GetWorkflowRunsByWorkflowIdSuccessfulResponse
  | {
      error: string;
    };

export type GetWorkflowRunByIdSuccessfulResponse = {
  workflowRun: WorkflowRun;
  workflowRunQuestionOutputs: (WorkflowRunStepQuestionOutput & {
    workflowStepId: string | null;
    uniqueIdentifer: string | null;
  })[];
  workflowSteps: WorkflowStep[];
  workflowStepQuestions: WorkflowStepQuestion[];
  workflowStepLinks: {
    linkId: string | null;
    fromStepId: string;
    toStepId: string | null;
  }[];
  workflowStepLinkConditions: WorkflowStepLinkCondition[];
  workflowStepIterateWithParentDependencies: WorkflowStepIterateWithParentDependency[];
  workflowRunStepQuestionOutputDocumentsUsed: (WorkflowRunStepQuestionOutputDocumentUsed & {
    filename: string;
  })[];
  workflowRunStepQuestionOutputDocumentUsedLocations: WorkflowRunStepQuestionOutputDocumentUsedLocation[];
  workflowRunStepQuestionOutputParentDocumentUsed: (WorkflowRunStepQuestionOutputParentDocumentUsed & {
    filename: string;
  })[];
  workflowRunStepQuestionOutputParentDocumentUsedLocations: WorkflowRunStepQuestionOutputParentDocumentUsedLocation[];
  workflowRunDraftInputs: WorkflowRunDraftInput[];
  workflowRunDraftInputsDocumentsUsed: WorkflowRunDraftInputDocumentUsed[];
};

export type GetWorkflowRunByIdResponse =
  | GetWorkflowRunByIdSuccessfulResponse
  | {
      error: string;
    };

export type GetWorkflowStepIterateWithParentDependenciesByIdSuccessfulResponse =
  {
    workflowStepIterateWithParentDependencies: WorkflowStepIterateWithParentDependency[];
  };

export type GetWorkflowStepIterateWithParentDependenciesByIdResponse =
  | GetWorkflowStepIterateWithParentDependenciesByIdSuccessfulResponse
  | {
      error: string;
    };

export type GetWorkflowStepPassthroughDocumentDependenciesByIdSuccessfulResponse =
  {
    workflowStepPassthroughDocumentDependencies: WorkflowStepPassthroughDocumentDependency[];
  };

export type GetWorkflowStepPassthroughDocumentDependenciesByIdResponse =
  | GetWorkflowStepPassthroughDocumentDependenciesByIdSuccessfulResponse
  | {
      error: string;
    };

export type UpdateWorkflowRunStepQuestionOutputsByStepIdSuccessfulResponse = {
  updatedWorkflowRunDraftInput: WorkflowRunDraftInput;
  updatedWorkflowRunDraftInputDocumentsUsed: WorkflowRunDraftInputDocumentUsed[];
};

export type UpdateWorkflowRunStepQuestionOutputByStepIdResponse =
  | UpdateWorkflowRunStepQuestionOutputsByStepIdSuccessfulResponse
  | {
      error: string;
    };

export type ReRunWorkflowRunDraftSuccessfulResponse = {
  updatedWorkflowRun: WorkflowRun;
};

export type RunWorkflowRunDraftResponse =
  | ReRunWorkflowRunDraftSuccessfulResponse
  | {
      error: string;
    };

// Validation for Workflow import:
export const zCreateWorkflowImportInput = z.object({
  workflow: z.object({
    name: z
      .string()
      .min(1, { message: 'Name must be at least 1 character long' }),
    description: z.string().optional(),
  }),
  workflowSteps: z.array(
    z.object({
      id: z
        .string()
        .min(1, { message: 'ID must be at least 1 character long' }),
      name: z
        .string()
        .min(1, { message: 'Name must be at least 1 character long' }),
      description: z.string(),
      acceptDocuments: z.boolean(),
      createdAt: z.string().optional(),
      iterateThroughInputs: z.boolean(),
      passthroughDocuments: z.boolean(),
    })
  ),
  workflowStepQuestions: z.array(
    z.object({
      id: z
        .string()
        .min(1, { message: 'ID must be at least 1 character long' }),
      workflowStepName: z.string().min(1, {
        message: 'Workflow step name must be at least 1 character long',
      }),
      llmPrompt: z
        .string()
        .min(1, { message: 'LLM prompt must be at least 1 character long' }),
      outputFormat: z.enum(WORKFLOW_STEP_OUTPUT_FORMATS),
      uniqueIdenfier: z.string().nullable(),
      requiresPythonScriptExecution: z.boolean(),
    })
  ),

  workflowStepLinks: z.array(
    z.object({
      fromStepName: z.string().min(1, {
        message: 'From step name must be at least 1 character long',
      }),
      toStepName: z
        .string()
        .min(1, { message: 'To step name must be at least 1 character long' }),
    })
  ),
  workflowStepLinkConditions: z.array(
    z.object({
      fromStepName: z.string().min(1, {
        message: 'From step name must be at least 1 character long',
      }),
      toStepName: z
        .string()
        .min(1, { message: 'To step name must be at least 1 character long' }),
      workflowStepOutputLLMPrompt: z.string().min(1, {
        message:
          'Workflow step output LLM prompt must be at least 1 character long',
      }),
      workflowStepLinkConditionType: z.enum(WORKFLOW_STEP_LINK_CONDITIONS),
      condition: z.string(),
    })
  ),

  workflowStepPassthroughDocumentsDependencies: z.array(
    z.object({
      workflowStepName: z.string().min(1, {
        message: 'Workflow step name must be at least 1 character long',
      }),
      passthroughFromParentStepName: z.string().min(1, {
        message:
          'Passthrough from parent step name must be at least 1 character long',
      }),
    })
  ),

  workflowStepIterateWithParentDependencies: z.array(
    z.object({
      workflowStepName: z.string().min(1, {
        message: 'Workflow step name must be at least 1 character long',
      }),
      iterateWithParentStepName: z.string().min(1, {
        message:
          'Iterate with parent step name must be at least 1 character long',
      }),
    })
  ),
});

/* -------------------------------------------------------------------------- */
/*                            LLM Output Validation                           */
/* -------------------------------------------------------------------------- */
export const zSingleSourceSchema = z.object({
  document_id: z.string().uuid(),
  page_number: z.number(),
  xmin: z.number().min(0).max(1),
  ymin: z.number().min(0).max(1),
  xmax: z.number().min(0).max(1),
  ymax: z.number().min(0).max(1),
});

export const zSingleSourceSchemaWithDocumentPageId = z.object({
  document_id: z.string().uuid(),
  document_page_id: z.string().uuid(),
  xmin: z.number().min(0).max(1),
  ymin: z.number().min(0).max(1),
  xmax: z.number().min(0).max(1),
  ymax: z.number().min(0).max(1),
});
export const zSourcesSchema = z.array(zSingleSourceSchema);
