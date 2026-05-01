import baseApi from "../baseApi";

// ==================== API RESPONSE WRAPPER ====================
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ==================== QUIZ TYPES ====================
export type QuizType = 'module' | 'mid-course' | 'final-exam';

// ==================== OPTION ====================
export interface QuizOption {
  id: string;
  text: string;
  image?: string;
}

// ==================== QUESTION ====================
export interface QuizQuestion {
  _id?: string;
  questionText: string;
  questionImage?: string;
  options: QuizOption[];
  correctAnswerId: string;
  marks: number;
  feedback?: string;
  order?: number;
}

// ==================== MAIN QUIZ ====================
export interface Quiz {
  _id?: string;
  title: string;
  description: string;
  descriptionImage?: string;
  instructions?: string;
  
  // Quiz Type & Association
  quizType: QuizType;
  courseId: string;
  moduleId?: string;
  afterModuleIds?: string[];
  
  // Questions (embedded)
  questions: QuizQuestion[];
  
  // Quiz Settings
  timeLimit?: number;
  passingScore: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  
  // Result Display
  showResultsAfter: 'immediate' | 'submission' | 'manual';
  canUserViewAnswers: boolean;
  showCorrectAnswers: boolean;
  
  // Scoring
  negativeMarkingEnabled: boolean;
  negativeMarkingPercentage: number;
  
  // Feedback
  overallFeedback?: string;
  passFeedback?: string;
  failFeedback?: string;
  classLink?: string; // Optional class link for live sessions
  
  // Status
  isActive: boolean;
  isPublished: boolean;
  
  // Virtuals
  totalQuestions?: number;
  totalMarks?: number;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// ==================== CREATE/UPDATE REQUESTS ====================
export interface CreateQuizRequest {
  title: string;
  description: string;
  descriptionImage?: string;
  instructions?: string;
  quizType?: QuizType;
  courseId?: string;
  moduleId?: string;
  afterModuleIds?: string[];
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResultsAfter?: 'immediate' | 'submission' | 'manual';
  canUserViewAnswers?: boolean;
  showCorrectAnswers?: boolean;
  negativeMarkingEnabled?: boolean;
  negativeMarkingPercentage?: number;
  overallFeedback?: string;
  passFeedback?: string;
  failFeedback?: string;
  classLink?: string;
}

// Legacy format used by course creation pages
export interface LegacyCreateQuizRequest {
  quiz: {
    title: string;
    description: string;
    descriptionImage?: string;
    classLink?: string;
    overallFeedback?: string;
    negativeMarkingPercentage?: number;
    canUserViewAnswers?: boolean;
  };
  questions: any[];
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  descriptionImage?: string;
  instructions?: string;
  questions?: QuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResultsAfter?: 'immediate' | 'submission' | 'manual';
  canUserViewAnswers?: boolean;
  showCorrectAnswers?: boolean;
  negativeMarkingEnabled?: boolean;
  negativeMarkingPercentage?: number;
  overallFeedback?: string;
  passFeedback?: string;
  failFeedback?: string;
  isActive?: boolean;
  isPublished?: boolean;
}

// ==================== QUIZ ATTEMPT ====================
export interface QuizAttemptAnswer {
  questionId: string;
  selectedOptionId: string | null;
  timeSpent?: number;
}

export interface QuizQuestionResult {
  questionId: string;
  questionText: string;
  questionImage?: string;
  selectedOptionId: string | null;
  selectedOptionText?: string;
  correctOptionId: string;
  correctOptionText?: string;
  allOptions?: QuizOption[];
  isCorrect: boolean;
  isSkipped: boolean;
  marksAwarded: number;
  negativeMarks: number;
  feedback?: string;
}

export interface QuizResult {
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  negativeMarks: number;
  finalScore: number;
  percentage: number;
  passingScore: number;
  passed: boolean;
  questionResults: QuizQuestionResult[];
  feedback?: string;
}

export interface QuizAttempt {
  _id?: string;
  quizId: string;
  courseId: string;
  userId: string;
  userEmail: string;
  userName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  timeSpent?: number;
  answers: QuizAttemptAnswer[];
  result?: QuizResult;
  status: 'in-progress' | 'submitted' | 'graded';
  createdAt?: string;
  updatedAt?: string;
}

// ==================== USER QUIZ STATUS ====================
export interface UserQuizStatus {
  hasAttempted: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
  lastAttempt?: QuizAttempt;
  bestResult?: QuizResult;
  canRetake: boolean;
}

// ==================== ANALYTICS ====================
export interface QuizAnalytics {
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

// ==================== QUIZ APPLICATION ====================
export interface QuizApplicationWithDetails {
  _id?: string;
  quizId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  quiz?: {
    _id?: string;
    title: string;
    description?: string;
    descriptionImage?: string;
  };
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    profilePhoto?: string;
    mobileNumber?: string;
    nid?: string;
    address?: string;
    emailVerified?: boolean;
  };
}

// ==================== SUBMIT REQUEST ====================
export interface SubmitQuizRequest {
  quizId: string;
  courseId: string;
  answers: QuizAttemptAnswer[];
  timeSpent: number;
}

// ==================== LEGACY SUPPORT ====================
// For backward compatibility with old components
export interface Question extends QuizQuestion {
  quizId?: string;
}
export interface Option extends QuizOption {}

// ==================== API ENDPOINTS ====================
export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== IMAGE UPLOAD ====================
    uploadQuizImage: builder.mutation<
      { imagePath: string; url: string; relativePath: string; filename: string },
      FormData
    >({
      query: (formData) => ({
        url: "/quizzes/upload-image",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<{ imagePath: string; url: string; relativePath: string; filename: string }>) => response.data,
    }),

    uploadMultipleQuizImages: builder.mutation<
      { images: { imagePath: string; url: string; relativePath: string; filename: string }[] },
      FormData
    >({
      query: (formData) => ({
        url: "/quizzes/upload-multiple-images",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<{ images: any[] }>) => response.data,
    }),

    // ==================== QUIZ CRUD ====================
    createQuiz: builder.mutation<{ quiz: Quiz }, CreateQuizRequest | LegacyCreateQuizRequest>({
      query: (data) => ({
        url: "/quizzes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Quiz"],
      transformResponse: (response: ApiResponse<{ quiz: Quiz }>) => response.data,
    }),

    getQuizzes: builder.query<{ quizzes: Quiz[] }, void>({
      query: () => "/quizzes",
      providesTags: ["Quiz"],
      transformResponse: (response: ApiResponse<{ quizzes: Quiz[] }>) => response.data,
    }),

    getQuizzesByCourse: builder.query<{ quizzes: Quiz[] }, string>({
      query: (courseId) => `/quizzes/course/${courseId}`,
      providesTags: (_result, _error, courseId) => [{ type: "Quiz", id: `course_${courseId}` }],
      transformResponse: (response: ApiResponse<{ quizzes: Quiz[] }>) => response.data,
    }),

    getQuizById: builder.query<{ quiz: Quiz }, string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Quiz", id }],
      transformResponse: (response: ApiResponse<{ quiz: Quiz }>) => response.data,
    }),

    getQuizForStudent: builder.query<{ quiz: Quiz; status: UserQuizStatus }, string>({
      query: (id) => `/quizzes/${id}/student`,
      providesTags: (_result, _error, id) => [{ type: "Quiz", id: `student_${id}` }],
      transformResponse: (response: ApiResponse<{ quiz: Quiz; status: UserQuizStatus }>) => response.data,
    }),

    updateQuiz: builder.mutation<{ quiz: Quiz }, { id: string } & UpdateQuizRequest>({
      query: ({ id, ...data }) => ({
        url: `/quizzes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Quiz", id }, "Quiz"],
      transformResponse: (response: ApiResponse<{ quiz: Quiz }>) => response.data,
    }),

    deleteQuiz: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quiz"],
    }),

    // ==================== QUIZ ATTEMPT FLOW ====================
    getUserQuizStatus: builder.query<UserQuizStatus, string>({
      query: (quizId) => `/quizzes/user/status/${quizId}`,
      providesTags: (_result, _error, quizId) => [{ type: "QuizAttempt", id: `status_${quizId}` }],
      transformResponse: (response: ApiResponse<UserQuizStatus>) => response.data,
    }),

    startQuizAttempt: builder.mutation<{ attempt: QuizAttempt }, { quizId: string; courseId: string }>({
      query: (data) => ({
        url: "/quizzes/attempt/start",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ attempt: QuizAttempt }>) => response.data,
    }),

    submitQuiz: builder.mutation<{ attempt: QuizAttempt; result: QuizResult }, SubmitQuizRequest>({
      query: (data) => ({
        url: "/quizzes/attempt/submit",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, args) => [
        "QuizAttempt",
        { type: "QuizAttempt", id: `status_${args.quizId}` },
        { type: "Enrollment", id: `${args.courseId}-progress` }
      ],
      transformResponse: (response: ApiResponse<{ attempt: QuizAttempt; result: QuizResult }>) => response.data,
    }),

    // Legacy support for old submit endpoint
    submitQuizAnswers: builder.mutation<{ attempt: QuizAttempt; result: QuizResult }, { quizId: string; courseId: string; answers: QuizAttemptAnswer[]; timeSpent?: number }>({
      query: ({ quizId, courseId, answers, timeSpent = 0 }) => ({
        url: "/quizzes/attempt/submit",
        method: "POST",
        body: { quizId, courseId, answers, timeSpent },
      }),
      invalidatesTags: ["QuizAttempt"],
      transformResponse: (response: ApiResponse<{ attempt: QuizAttempt; result: QuizResult }>) => response.data,
    }),

    // ==================== USER ATTEMPTS ====================
    getUserQuizAttempts: builder.query<QuizAttempt[], void>({
      query: () => "/quizzes/user/my-attempts",
      providesTags: ["QuizAttempt"],
      transformResponse: (response: ApiResponse<{ attempts: QuizAttempt[] }>) => response.data?.attempts || [],
    }),

    getUserQuizAttempt: builder.query<{ attempt: QuizAttempt | null }, string>({
      query: (quizId) => `/quizzes/user/attempt/${quizId}`,
      providesTags: (_result, _error, quizId) => [{ type: "QuizAttempt", id: quizId }],
      transformResponse: (response: ApiResponse<{ attempt: QuizAttempt | null }>) => response.data,
    }),

    // ==================== ADMIN ====================
    getQuizAttempts: builder.query<{ attempts: QuizAttempt[] }, string>({
      query: (quizId) => `/quizzes/${quizId}/attempts`,
      providesTags: (_result, _error, quizId) => [{ type: "QuizAttempt", id: `quiz_${quizId}` }],
      transformResponse: (response: ApiResponse<{ attempts: QuizAttempt[] }>) => response.data,
    }),

    getQuizAnalytics: builder.query<QuizAnalytics, string>({
      query: (quizId) => `/quizzes/${quizId}/analytics`,
      providesTags: (_result, _error, quizId) => [{ type: "QuizAnalytics", id: quizId }],
      transformResponse: (response: ApiResponse<QuizAnalytics>) => response.data,
    }),

    // ==================== QUIZ APPLICATIONS (Admin) ====================
    getAllQuizApplications: builder.query<QuizApplicationWithDetails[], void>({
      query: () => "/quizzes/applications",
      providesTags: ["QuizApplication"],
      transformResponse: (response: ApiResponse<QuizApplicationWithDetails[]>) => response.data || [],
    }),

    approveQuizApplication: builder.mutation<{ success: boolean }, string>({
      query: (applicationId) => ({
        url: `/quizzes/applications/${applicationId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["QuizApplication"],
    }),

    rejectQuizApplication: builder.mutation<{ success: boolean }, { applicationId: string; rejectionReason: string }>({
      query: ({ applicationId, rejectionReason }) => ({
        url: `/quizzes/applications/${applicationId}/reject`,
        method: "POST",
        body: { rejectionReason },
      }),
      invalidatesTags: ["QuizApplication"],
    }),

    // ==================== USER QUIZ APPLICATIONS ====================
    getUserQuizApplications: builder.query<QuizApplicationWithDetails[], void>({
      query: () => "/quizzes/applications/my",
      providesTags: ["QuizApplication"],
      transformResponse: (response: ApiResponse<QuizApplicationWithDetails[]>) => response.data || [],
    }),

    applyForQuiz: builder.mutation<{ success: boolean; application: QuizApplicationWithDetails }, string>({
      query: (quizId) => ({
        url: `/quizzes/${quizId}/apply`,
        method: "POST",
      }),
      invalidatesTags: ["QuizApplication"],
    }),

    checkQuizApprovalStatus: builder.query<{ status: string; application?: QuizApplicationWithDetails }, string>({
      query: (quizId) => `/quizzes/${quizId}/approval-status`,
      providesTags: (_result, _error, quizId) => [{ type: "QuizApplication", id: quizId }],
      transformResponse: (response: ApiResponse<{ status: string; application?: QuizApplicationWithDetails }>) => response.data,
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  // Image Upload
  useUploadQuizImageMutation,
  useUploadMultipleQuizImagesMutation,
  
  // Quiz CRUD
  useCreateQuizMutation,
  useGetQuizzesQuery,
  useGetQuizzesByCourseQuery,
  useGetQuizByIdQuery,
  useLazyGetQuizByIdQuery,
  useGetQuizForStudentQuery,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  
  // Quiz Attempt Flow
  useGetUserQuizStatusQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizMutation,
  useSubmitQuizAnswersMutation, // Legacy
  
  // User Attempts
  useGetUserQuizAttemptsQuery,
  useGetUserQuizAttemptQuery,
  
  // Admin
  useGetQuizAttemptsQuery,
  useGetQuizAnalyticsQuery,
  
  // Quiz Applications (Admin)
  useGetAllQuizApplicationsQuery,
  useApproveQuizApplicationMutation,
  useRejectQuizApplicationMutation,
  
  // Quiz Applications (User)
  useGetUserQuizApplicationsQuery,
  useApplyForQuizMutation,
  useCheckQuizApprovalStatusQuery,
} = quizApi;