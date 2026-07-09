import type { WorkspaceSnapshot } from '../../store/types';

const SAMPLE_TIMESTAMP = 1767225600000;

export function createSampleWorkspaceSnapshot(): WorkspaceSnapshot {
  return {
    files: {
      byId: {
        sample_requirement_brief: {
          id: 'sample_requirement_brief',
          bucket: 'requirement',
          name: 'Course-report-requirements.txt',
          mimeType: 'text/plain',
          size: 1840,
          source: 'upload',
          status: 'ready',
          createdAt: SAMPLE_TIMESTAMP,
          updatedAt: SAMPLE_TIMESTAMP,
          rawTextStatus: 'ready',
          note: 'Hard requirements for the report structure and grading criteria.',
          parsedText: [
            'Prepare a 6-8 page technical report for a course project on solar panel output forecasting.',
            'The report must include: introduction, dataset description, method, results, discussion, and conclusion.',
            'Use formal academic tone. Include at least one quantitative table and discuss limitations.',
            'Do not invent measured data. Claims must be grounded in the provided results notes.',
          ].join('\n'),
        },
        sample_results_notes: {
          id: 'sample_results_notes',
          bucket: 'results',
          name: 'Experiment-results-summary.csv',
          mimeType: 'text/csv',
          size: 1320,
          source: 'upload',
          status: 'ready',
          createdAt: SAMPLE_TIMESTAMP,
          updatedAt: SAMPLE_TIMESTAMP,
          rawTextStatus: 'ready',
          note: 'Synthetic benchmark summary for the demo workspace.',
          parsedText: [
            'model,mae,rmse,r2,notes',
            'Persistence baseline,18.4,25.7,0.61,Uses previous-hour output as forecast',
            'Linear regression,13.2,19.5,0.74,Uses irradiance temperature and hour-of-day features',
            'Random forest,9.8,14.1,0.86,Best overall validation score',
            'The random forest model reduced MAE by 46.7 percent compared with the persistence baseline.',
            'Largest errors occurred during rapidly changing cloud-cover periods.',
          ].join('\n'),
        },
        sample_reference_style: {
          id: 'sample_reference_style',
          bucket: 'reference',
          name: 'Reference-style-notes.txt',
          mimeType: 'text/plain',
          size: 960,
          source: 'upload',
          status: 'ready',
          createdAt: SAMPLE_TIMESTAMP,
          updatedAt: SAMPLE_TIMESTAMP,
          rawTextStatus: 'ready',
          note: 'Use for tone and organization only, not for factual claims.',
          parsedText: [
            'Preferred style: concise academic paragraphs, explicit transition sentences, and restrained claims.',
            'Section pattern: start with the purpose of the section, present evidence, then explain implications.',
            'Tables should have descriptive titles and short notes explaining how to interpret the values.',
            'Avoid marketing language and avoid unsupported superlatives.',
          ].join('\n'),
        },
      },
      idsByBucket: {
        requirement: ['sample_requirement_brief'],
        results: ['sample_results_notes'],
        reference: ['sample_reference_style'],
      },
    },
    document: {
      meta: {
        title: 'Solar Panel Output Forecasting with Weather Features',
        subtitle: 'Sample technical report workspace',
        authors: ['KYY Report Demo'],
        abstract:
          'This sample report evaluates simple forecasting methods for short-term solar panel output prediction. Using the provided benchmark summary, the draft compares a persistence baseline, linear regression, and random forest model, then discusses accuracy gains and remaining limitations under changing cloud conditions.',
        template: {
          id: 'golden-standard',
          pageSize: 'letterpaper',
          margin: '1in',
          lineSpacing: '1.5',
        },
      },
      sectionsById: {
        sample_intro: {
          id: 'sample_intro',
          key: 'introduction',
          title: 'Introduction',
          level: 1,
          content:
            'Accurate short-term solar output forecasting helps operators plan grid balancing, storage use, and demand response. This report demonstrates a compact academic workflow for turning project requirements, result notes, and style references into a structured LaTeX draft. The analysis focuses on comparing a persistence baseline with two feature-based models.',
          blocks: [],
          status: 'idle',
          updatedAt: SAMPLE_TIMESTAMP,
          linkedFileIds: ['sample_requirement_brief', 'sample_results_notes'],
        },
        sample_dataset: {
          id: 'sample_dataset',
          key: 'dataset-and-features',
          title: 'Dataset and Features',
          level: 1,
          content:
            'The demo evidence describes a forecasting task that uses weather and time-derived features. The listed features include irradiance, temperature, and hour-of-day indicators. Because the source material is a summarized benchmark rather than raw observations, this draft avoids claiming sample size, site location, or sensor details that are not present in the uploaded results.',
          blocks: [],
          status: 'idle',
          updatedAt: SAMPLE_TIMESTAMP,
          linkedFileIds: ['sample_requirement_brief', 'sample_results_notes', 'sample_reference_style'],
        },
        sample_results: {
          id: 'sample_results',
          key: 'results',
          title: 'Results',
          level: 1,
          content:
            'The random forest model achieved the strongest validation performance among the three reported approaches. Its MAE of 9.8 was lower than the linear regression model and substantially lower than the persistence baseline. The results suggest that nonlinear feature interactions are useful for this forecasting task, while still leaving room for improvement during rapidly changing weather periods.',
          blocks: [
            {
              id: 'sample_results_table',
              type: 'table',
              title: 'Validation performance by forecasting method',
              columns: ['Model', 'MAE', 'RMSE', 'R2', 'Interpretation'],
              rows: [
                ['Persistence baseline', '18.4', '25.7', '0.61', 'Previous-hour output only'],
                ['Linear regression', '13.2', '19.5', '0.74', 'Weather and time features'],
                ['Random forest', '9.8', '14.1', '0.86', 'Best validation score'],
              ],
              note: 'Values are taken from the demo results summary. Lower MAE/RMSE and higher R2 indicate better predictive performance.',
            },
            {
              id: 'sample_mae_chart',
              type: 'chart',
              chartType: 'bar',
              title: 'MAE comparison across models',
              x: ['Persistence', 'Linear', 'Random forest'],
              series: [{ label: 'MAE', values: [18.4, 13.2, 9.8] }],
              yLabel: 'MAE',
              note: 'The random forest model reduces MAE by 46.7 percent compared with the persistence baseline.',
            },
          ],
          status: 'idle',
          updatedAt: SAMPLE_TIMESTAMP,
          linkedFileIds: ['sample_results_notes', 'sample_reference_style'],
        },
        sample_discussion: {
          id: 'sample_discussion',
          key: 'discussion-and-limitations',
          title: 'Discussion and Limitations',
          level: 1,
          content:
            'The performance differences indicate that engineered weather and time features improve forecasting quality relative to a naive persistence strategy. However, the evidence also notes that the largest errors occur during rapidly changing cloud-cover periods. A stronger follow-up study would evaluate additional cloud-motion features, compare more validation windows, and report uncertainty intervals for operational use.',
          blocks: [],
          status: 'idle',
          updatedAt: SAMPLE_TIMESTAMP,
          linkedFileIds: ['sample_requirement_brief', 'sample_results_notes'],
        },
        sample_conclusion: {
          id: 'sample_conclusion',
          key: 'conclusion',
          title: 'Conclusion',
          level: 1,
          content:
            'This sample workspace shows the intended KYY Report loop: upload requirements, results, and reference style materials; generate a structured report; inspect linked evidence; edit sections; and compile a PDF preview. Based on the supplied benchmark, the random forest method is the best-performing candidate, but the conclusion remains bounded by the limited evidence available in the uploaded results summary.',
          blocks: [],
          status: 'idle',
          updatedAt: SAMPLE_TIMESTAMP,
          linkedFileIds: ['sample_requirement_brief', 'sample_results_notes', 'sample_reference_style'],
        },
      },
      sectionOrder: ['sample_intro', 'sample_dataset', 'sample_results', 'sample_discussion', 'sample_conclusion'],
    },
    chat: {
      globalMessageIds: ['sample_system_message'],
      sectionMessageIds: {},
      messagesById: {
        sample_system_message: {
          id: 'sample_system_message',
          scope: { type: 'global' },
          role: 'assistant',
          content:
            'Sample workspace loaded. Try editing a section, compiling the preview, or asking the AI to revise the Results section while preserving the uploaded evidence.',
          createdAt: SAMPLE_TIMESTAMP,
          status: 'done',
          referencedFileIds: ['sample_requirement_brief', 'sample_results_notes', 'sample_reference_style'],
        },
      },
    },
    snapshots: {
      bySectionId: {},
    },
    ui: {
      workspace: {
        trayOpenByBucket: {
          requirement: false,
          results: false,
          reference: false,
        },
        expandedBucket: null,
      },
      hints: {
        resultsFirstUploadHintVisible: false,
        resultsFirstUploadHintDismissedForever: false,
        resultsFirstUploadHintHasShownOnce: true,
        resultsFirstUploadHintShownAt: SAMPLE_TIMESTAMP,
      },
      preview: {
        status: 'idle',
        pdfBase64: undefined,
        compileError: undefined,
        needsRefresh: true,
        zoom: 1,
        currentPage: 1,
      },
    },
  };
}
