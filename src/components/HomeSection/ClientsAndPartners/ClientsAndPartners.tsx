import ModernSectionHeader from "@/components/shared/ModernSectionHeader";
import Marquee from "react-fast-marquee";

const ClientsAndPartners = () => {
  const data = [
    {
      id: 1,
      title: "BRAC Institute of Skills Development",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744102009/isd-1536x864_v9ipf4.png",
    },
    {
      id: 2,
      title: "MILITARY ENGINEER SERVICES",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744102842/military-768x432_jl3f0m.png",
    },
    {
      id: 3,
      title: "বাংলাদেশ কারিগরি শিক্ষা বোর্ড",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744100349/BANGLADESH-KARIGORI-SIKKHA-150x150_eteasq.png",
    },
    {
      id: 4,
      title: "জাতীয় দক্ষতা উন্নয়ন কর্তৃপক্ষ",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744102249/JATIO-DOKKHOTA-1024x576_ioek21.png",
    },
    {
      id: 5,
      title: "Saic Institute of Management & Technology",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744103188/sAIC-INSTUTE_gqsk9b.png",
    },
    {
      id: 6,
      title: "BANGLAMARK",
      photoUrl:
        "https://placehold.co/150x80/e2e8f0/475569?text=BANGLAMARK",
    },
    {
      id: 7,
      title: "Sincos",
      photoUrl:
        "https://placehold.co/150x80/e2e8f0/475569?text=Sincos",
    },
    {
      id: 8,
      title: "Hatil",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744101872/hatil-300x169_kvsbwk.png",
    },
    {
      id: 9,
      title: "Certiport",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744100857/Certiport.bak_rktequ.png",
    },
    {
      id: 11,
      title: "Bangladesh Association of Software and Information Services",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744100565/basic-768x432_ydy7pq.png",
    },
    {
      id: 12,
      title: "Robust 3D",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744103136/Robust-1536x864_nflpwt.png",
    },
    {
      id: 13,
      title: "Immigrant Jobs World Creative Community",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744100988/craetive-community.bak_xl8ipm.png",
    },
    {
      id: 14,
      title: "Engineering IT Skills",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744101744/engineering-skill-it.bak_tegoye.png",
    },
    {
      id: 15,
      title: "Major Construction",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744102331/major-768x432_mrxcvy.png",
    },
    {
      id: 16,
      title: "Certify Bangladesh",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744100809/certify-bangladesh.bak_svftlw.png",
    },
    {
      id: 17,
      title: "BEC",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744100673/bec-1024x576_vwwegd.png",
    },
    {
      id: 18,
      title: "Creative Consultant",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744101060/Creative-consaltant.bak_wvbipj.png",
    },
    {
      id: 19,
      title: "Spark Steel",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744103406/Spark-steel_rc3u7j.png",
    },
    {
      id: 20,
      title: "SDA Structural",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744103302/Sda-stractural-1024x576_ecispt.png",
    },
    {
      id: 21,
      title: "Archstone Interior",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744104461/Archstone-interirors.bak_kjuju9.png",
    },
    {
      id: 22,
      title: "SB Consultant Ltd",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744103243/Sb-consultant-ltd-768x432_f0xhrw.png",
    },
    {
      id: 23,
      title: "Onestop Design Solution",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744103013/one-stop-768x432_ag048j.png",
    },
    {
      id: 24,
      title: "Design and Development Solution",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744101665/Design-and-development-solution-768x432_b3xbsk.png",
    },
    {
      id: 25,
      title: "Compliance BD Ltd",
      photoUrl:
        "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744100938/Compliance-BD-Ltd-300x169_axgubr.png",
    },
  ];

  // Split data into 2 groups instead of 3
  const chunked = (arr: typeof data, size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );

  const groups = chunked(data, Math.ceil(data.length / 2));

  return (
    <section className="py-10 lg:py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ModernSectionHeader
          badge="Partners"
          title="Trusted By Industry Leaders"
          subtitle="Building a strong network through partnerships with leading organizations and institutions."
          align="center"
        />

        {/* Marquee Section */}
        <div className="space-y-4">
          {groups.map((group, index) => (
            <Marquee
              key={index}
              pauseOnHover
              gradient={true}
              gradientWidth={80}
              gradientColor="#ffffff"
              direction={index % 2 === 1 ? "right" : "left"}
              speed={35 + index * 10}
              className="py-3"
            >
              <div className="flex gap-4 items-center">
                {group.map((item) => (
                  <div
                    key={item.id}
                    className="group w-44 flex-shrink-0 px-4 py-5 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 mx-2"
                  >
                    <div className="relative overflow-hidden rounded-lg bg-white p-3 h-14 flex items-center justify-center">
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="h-10 w-full object-contain mx-auto filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://placehold.co/150x80/e2e8f0/475569?text=${encodeURIComponent(item.title || "Partner")}`;
                        }}
                      />
                    </div>
                    <h3 className="text-xs font-medium text-gray-600 text-center mt-3 line-clamp-1 group-hover:text-gray-900 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                ))}
              </div>
            </Marquee>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsAndPartners;
