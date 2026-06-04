import React from 'react';
import { HiClock, HiRefresh, HiQuestionMarkCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const PendingApproval = ({ userName, onCheckStatus }) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[520px] text-center">
        <div className="mb-9 flex justify-center">
          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#fff3bf] shadow-[0_0_28px_rgba(253,224,71,0.45)]">
            <HiClock className="h-12 w-12 text-[#d08725]" />
          </div>
        </div>

        <h1 className="mb-4 text-[2rem] font-extrabold leading-tight text-[#1f2937]">
          Approval Pending
        </h1>

        <p className="mx-auto mb-10 max-w-[500px] text-[1.0625rem] leading-[1.7] text-[#6b7280]">
          Hello {userName}, your seller account is currently under review by our administration team.
          Approval usually takes less than 24 hours. You'll gain full dashboard access on verified.
        </p>

        <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate('/properties')}
            className="btn btn-primary min-h-[56px] rounded-[10px] px-6 font-extrabold"
            type="button"
          >
            Browse Properties
          </button>
          <button
            className="btn min-h-[56px] rounded-[10px] border border-[#e2e8f0] bg-[#f1f5fb] px-6 font-extrabold text-primary hover:bg-[#e8eef8]"
            onClick={onCheckStatus}
            type="button"
          >
            <HiRefresh className="text-xl" />
            Check Status Now
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[0.875rem]">
          <HiQuestionMarkCircle className="text-[#9ca3af]" />
          <span className="text-[#94a3b8]">Need help?</span>
          <button
            onClick={() => navigate('/support')}
            className="cursor-pointer border-none bg-transparent p-0 font-bold text-primary hover:underline"
            type="button"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
