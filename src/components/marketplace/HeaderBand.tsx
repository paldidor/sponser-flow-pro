interface HeaderBandProps {
  count: number;
}

export const HeaderBand = ({ count }: HeaderBandProps) => {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-t-[14px] border-b border-[#F3F4F6] bg-gradient-to-r from-[#EFF6FF] to-[#EEF2FF] px-6 py-6 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[20px] font-semibold leading-7 text-[#101828]">
          All Opportunities
        </h2>
        <span className="text-[14px] leading-5 text-[#4A5565]">
          • Browse all available sponsorship opportunities
        </span>
      </div>
      <div className="inline-flex items-center rounded-full bg-[#DBEAFE] px-3 py-1">
        <span className="text-[14px] font-medium leading-5 text-[#193CB8]">
          {count} {count === 1 ? "opportunity" : "opportunities"}
        </span>
      </div>
    </div>
  );
};
