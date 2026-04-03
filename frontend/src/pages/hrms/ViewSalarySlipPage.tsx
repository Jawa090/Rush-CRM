import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { payrollApi } from "@/lib/api";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
];

export default function ViewSalarySlipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const slipRef = useRef<HTMLDivElement>(null);

  // Get company details from localStorage
  const companyName = localStorage.getItem('company_name') || 'Your Company Name';
  const companyAddress = localStorage.getItem('company_address') || 'Company Address, City';

  const { data: slipData, isLoading } = useQuery({
    queryKey: ['salary-slip', id],
    queryFn: () => payrollApi.getSalarySlipById(id!),
    enabled: !!id,
  });

  const slip = slipData?.data;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!slip) {
    return <div className="flex items-center justify-center h-96">Salary slip not found</div>;
  }

  const earnings = slip.items?.filter((i: any) => i.component_type === 'earning') || [];
  const deductions = slip.items?.filter((i: any) => i.component_type === 'deduction') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hrms/payroll')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Salary Slip</h1>
            <p className="text-sm text-muted-foreground">
              {slip.first_name} {slip.last_name} - {MONTHS.find(m => m.value === slip.month)?.label} {slip.year}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div ref={slipRef} className="bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>

            {/* Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">SALARY SLIP</h1>
              <p className="text-sm text-gray-600">{companyName}</p>
              <p className="text-xs text-gray-500">{companyAddress}</p>
            </div>

            {/* Employee Info */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-300">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-32">Employee Name:</span>
                    <span className="px-3 py-1.5 flex-1">{slip.first_name} {slip.last_name}</span>
                  </div>
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-32">Designation:</span>
                    <span className="px-3 py-1.5 flex-1">{slip.designation || '—'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-32">Employee ID:</span>
                    <span className="px-3 py-1.5 flex-1">{slip.emp_code}</span>
                  </div>
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-32">Department:</span>
                    <span className="px-3 py-1.5 flex-1">{slip.department}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-300">Employment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-40">Total Working Days:</span>
                    <span className="px-3 py-1.5 flex-1">30</span>
                  </div>
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-40">Days Worked:</span>
                    <span className="px-3 py-1.5 flex-1">30</span>
                  </div>
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-40">Salary/Day:</span>
                    <span className="px-3 py-1.5 flex-1">{Math.round(Number(slip.basic_salary) / 30).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-40">Absents:</span>
                    <span className="px-3 py-1.5 flex-1">0</span>
                  </div>
                  <div className="flex border border-red-500">
                    <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-40">Late Arrivals:</span>
                    <span className="px-3 py-1.5 flex-1">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaves Quota */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-300">Leaves Quota</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <table className="w-full text-sm border border-red-500">
                    <thead>
                      <tr className="bg-red-50 border-b border-red-500">
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Leaves Taken</th>
                        <th className="text-center px-3 py-2 font-semibold text-gray-700">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-red-500"><td className="px-3 py-2">Sick:</td><td className="text-center px-3 py-2">0</td></tr>
                      <tr className="border-b border-red-500"><td className="px-3 py-2">Casual:</td><td className="text-center px-3 py-2">0</td></tr>
                      <tr className="border-b border-red-500"><td className="px-3 py-2">Annual:</td><td className="text-center px-3 py-2">0</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className="w-full text-sm border border-red-500">
                    <thead>
                      <tr className="bg-red-50 border-b border-red-500">
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Balance Leaves</th>
                        <th className="text-center px-3 py-2 font-semibold text-gray-700">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-red-500"><td className="px-3 py-2">Sick:</td><td className="text-center px-3 py-2">0</td></tr>
                      <tr className="border-b border-red-500"><td className="px-3 py-2">Casual:</td><td className="text-center px-3 py-2">0</td></tr>
                      <tr className="border-b border-red-500"><td className="px-3 py-2">Annual:</td><td className="text-center px-3 py-2">0</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            {/* Earnings & Deductions */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-300">Earning & Deductions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <table className="w-full text-sm border border-red-500">
                    <thead>
                      <tr className="bg-red-50 border-b border-red-500">
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Earning</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.map((e: any, i: number) => (
                        <tr key={i} className="border-b border-red-500">
                          <td className="px-3 py-2">{e.component_name}</td>
                          <td className="text-right px-3 py-2">{Number(e.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-red-50 font-bold">
                        <td className="px-3 py-2">Gross Salary</td>
                        <td className="text-right px-3 py-2">{Number(slip.total_earnings).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className="w-full text-sm border border-red-500">
                    <thead>
                      <tr className="bg-red-50 border-b border-red-500">
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Deductions</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deductions.map((d: any, i: number) => (
                        <tr key={i} className="border-b border-red-500">
                          <td className="px-3 py-2">{d.component_name}</td>
                          <td className="text-right px-3 py-2">{Number(d.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-red-50 font-bold">
                        <td className="px-3 py-2">Net Paid</td>
                        <td className="text-right px-3 py-2">{Number(slip.net_salary).toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-red-500">
                        <td className="px-3 py-2">Issuance Date</td>
                        <td className="text-right px-3 py-2 text-xs">{new Date(slip.generated_at).toLocaleDateString()}</td>
                      </tr>
                      <tr className="border-b border-red-500">
                        <td className="px-3 py-2">Payment Mode</td>
                        <td className="text-right px-3 py-2">Bank</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* HR KPIs & Note */}
            <div className="mb-6">
              <table className="w-full text-sm border border-red-500">
                <thead>
                  <tr className="bg-red-50 border-b border-red-500">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">HR KPIs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 text-xs">HR KPIs Allowance (Late Arrival, Absent, Missing Attendance, Adherence to HR Policies)</td>
                  </tr>
                </tbody>
              </table>
              <table className="w-full text-sm border border-red-500 mt-2">
                <thead>
                  <tr className="bg-red-50 border-b border-red-500">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">NOTE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 text-xs">Please verify your salary slip and report any discrepancies to HR within 3 working days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-300">
              <p>This is a computer-generated salary slip and does not require a signature.</p>
              <p className="mt-1">For any queries, please contact Human Resource Department</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
