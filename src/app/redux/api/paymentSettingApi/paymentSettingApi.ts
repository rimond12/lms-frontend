import baseApi from "../baseApi";

export interface IPaymentSetting {
  _id?: string;
  bkashNumber: string;
  bkashType: string;
  nagadNumber: string;
  nagadType: string;
  rocketNumber?: string;
  rocketType?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  paymentInstructions?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type PaymentSettingResponse = {
  success: boolean;
  message: string;
  data: IPaymentSetting;
};

const paymentSettingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentSetting: builder.query<PaymentSettingResponse, void>({
      query: () => "/payment-settings",
      providesTags: ["PaymentSetting"],
    }),
    updatePaymentSetting: builder.mutation<
      PaymentSettingResponse,
      Partial<IPaymentSetting>
    >({
      query: (payload) => ({
        url: "/payment-settings",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["PaymentSetting"],
    }),
  }),
});

export const {
  useGetPaymentSettingQuery,
  useUpdatePaymentSettingMutation,
} = paymentSettingApi;

export default paymentSettingApi;
