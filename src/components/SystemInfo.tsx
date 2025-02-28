import { System } from "@/lib/types";

const SystemInfo: React.FC<{ systemInfo: System; extended?: boolean }> = ({
  systemInfo,
  extended,
}) => {
  return (
    <div className="grid grid-cols-5 gap-1 text-sm mt-2">
      <div className="md:col-span-3 col-span-5 flex items-center gap-1">
        <div className="font-light">CPU</div>
        <div className="font-medium">{systemInfo.cpu_name}</div>
      </div>
      <div className="md:col-span-1 col-span-3 flex items-center gap-1">
        <div className="font-light">RAM</div>
        <div className="font-medium">{systemInfo.ram_gb}GB</div>
      </div>
      <div className="md:col-span-1 col-span-2 flex items-center gap-1 justify-end">
        <div className="font-light">OS</div>
        <div className="font-medium">{systemInfo.kernel_type}</div>
      </div>
      {extended && (
        <>
          <div className="col-span-3 flex items-center gap-1">
            <div className="font-light">Kernel Release</div>
            <div className="font-medium">{systemInfo.kernel_release}</div>
          </div>
          <div className="col-span-2 flex items-center gap-1">
            <div className="font-light">Architecture</div>
            <div className="font-medium">{systemInfo.cpu_arch}</div>
          </div>

          <div className="col-span-5 flex items-center gap-1">
            <div className="font-light">Version</div>
            <div
              className="font-medium truncate"
              title={systemInfo.system_version}
            >
              {systemInfo.system_version}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemInfo;
