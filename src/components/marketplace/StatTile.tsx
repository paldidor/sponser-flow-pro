interface StatTileProps {
  icon: string;
  value: string | number;
  label: string;
}

export const StatTile = ({ icon, value, label }: StatTileProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[10px] border border-[rgba(0,170,254,0.20)] py-2">
      <img src={icon} alt="" className="h-4 w-4" aria-hidden="true" />
      <div className="text-[14px] font-bold leading-[21px] text-[#101828]">
        {value}
      </div>
      <div className="text-[10px] leading-[13.33px] tracking-[0.12px] text-[#6A7282]">
        {label}
      </div>
    </div>
  );
};
