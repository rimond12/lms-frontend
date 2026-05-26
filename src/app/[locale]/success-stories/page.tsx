import SuccessStoriesFullPage from '@/components/shared/SuccessStoriesFullPage';

export const metadata = {
  title: 'সাফল্যের গল্প | ইমিগ্র্যান্ট জবস ওয়ার্ল্ড ট্রেনিং',
  description: 'ইমিগ্র্যান্ট জবস ওয়ার্ল্ড প্রশিক্ষণের মাধ্যমে সফল হয়ে উঠা শিক্ষার্থীদের অনুপ্রেরণাদায়ক গল্প',
};

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <SuccessStoriesFullPage />
    </div>
  );
}
