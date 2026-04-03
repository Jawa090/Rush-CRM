import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Download, ArrowLeft, Settings } from "lucide-react";
import { employeesApi, payrollApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

type Component = { name: string; amount: number };

export default function GenerateSalarySlipPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const slipRef = useRef<HTMLDivElement>(null);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [basicSalary, setBasicSalary] = useState("");
  const [earnings, setEarnings] = useState<Component[]>([]);
  const [deductions, setDeductions] = useState<Component[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Company details (editable)
  const [companyName, setCompanyName] = useState(localStorage.getItem('company_name') || 'Your Company Name');
  const [companyAddress, setCompanyAddress] = useState(localStorage.getItem('company_address') || 'Company Address, City');
  const [showSettings, setShowSettings] = useState(false);

  const saveCompanyDetails = () => {
    localStorage.setItem('company_name', companyName);
    localStorage.setItem('company_address', companyAddress);
    setShowSettings(false);
    toast({ title: "Company details saved" });
  };

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll(),
  });

  const employees = employeesData?.data || [];
  const employee = employees.find((e: any) => e.id === selectedEmployee);

  // Auto-calculate salary breakdown when basic salary changes
  const calculateBreakdown = (salary: number) => {
    if (!salary || salary <= 0) {
      setEarnings([]);
      setDeductions([]);
      return;
    }

    // Earnings breakdown (matching image)
    const utilityAllowances = Math.round(salary * 0.10); // 10%
    const medicalAllowances = Math.round(salary * 0.08); // 8%
    const kpiIncentives = 0; // Can be added manually
    const commission = 0;
    const specialAllowance = 0;
    const lastMonthAdjustment = 0;
    const overTime = 0;
    const specialLeverage = 0;
    
    setEarnings([
      { name: "Utility Allowances", amount: utilityAllowances },
      { name: "Medical Allowances", amount: medicalAllowances },
      { name: "KPI Incentives", amount: kpiIncentives },
      { name: "Commission", amount: commission },
      { name: "Special Allowance", amount: specialAllowance },
      { name: "Last month Adjustment", amount: lastMonthAdjustment },
      { name: "Over Time", amount: overTime },
      { name: "Special Leverage", amount: specialLeverage },
    ]);

    // Deductions (matching image)
    const advanceSalary = 0;
    const loan = 0;
    const pfAmount = 0;
    const tax = 0;
    const lateArrival = 0;
    const absent = 0;
    const previousMonthDeduction = 0;
    
    setDeductions([
      { name: "Advance Salary", amount: advanceSalary },
      { name: "Loan", amount: loan },
      { name: "PF Amount", amount: pfAmount },
      { name: "Tax", amount: tax },
      { name: "Late Arrival", amount: lateArrival },
      { name: "Absent", amount: absent },
      { name: "Previous month deduction", amount: previousMonthDeduction },
    ]);
  };

  const handleBasicSalaryChange = (value: string) => {
    setBasicSalary(value);
    const salary = Number(value);
    if (salary > 0) {
      calculateBreakdown(salary);
    }
  };

  const totalEarnings = Number(basicSalary || 0) + earnings.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const netSalary = totalEarnings - totalDeductions;

  const addEarning = () => setEarnings([...earnings, { name: "", amount: 0 }]);
  const removeEarning = (index: number) => setEarnings(earnings.filter((_, i) => i !== index));
  const updateEarning = (index: number, field: keyof Component, value: any) => {
    const updated = [...earnings];
    updated[index] = { ...updated[index], [field]: value };
    setEarnings(updated);
  };

  const addDeduction = () => setDeductions([...deductions, { name: "", amount: 0 }]);
  const removeDeduction = (index: number) => setDeductions(deductions.filter((_, i) => i !== index));
  const updateDeduction = (index: number, field: keyof Component, value: any) => {
    const updated = [...deductions];
    updated[index] = { ...updated[index], [field]: value };
    setDeductions(updated);
  };


  const handleGenerate = async () => {
    if (!selectedEmployee || !basicSalary) {
      toast({ title: "Please select employee and enter basic salary", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      await payrollApi.generateSalarySlip({
        employee_id: selectedEmployee,
        month,
        year,
        basic_salary: Number(basicSalary),
        earnings: earnings.filter(e => e.name && e.amount),
        deductions: deductions.filter(d => d.name && d.amount),
      });
      toast({ title: "Salary slip generated successfully" });
      navigate('/hrms/payroll');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!slipRef.current) return;
    
    // Use html2canvas or similar library for PDF generation
    // For now, just print
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hrms/payroll')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Generate Salary Slip</h1>
            <p className="text-sm text-muted-foreground">Create a new salary slip for an employee</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" /> Company Details
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={!selectedEmployee}>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !selectedEmployee}>
            {isGenerating ? "Generating..." : "Generate Slip"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee & Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} - {emp.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Basic Salary *</Label>
                <Input 
                  type="number" 
                  value={basicSalary} 
                  onChange={(e) => handleBasicSalaryChange(e.target.value)} 
                  placeholder="Enter basic salary (e.g., 70000)" 
                />
                <p className="text-xs text-muted-foreground">Allowances and deductions will be calculated automatically</p>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Earnings</CardTitle>
              <Button size="sm" variant="outline" onClick={addEarning}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {earnings.map((earning, index) => (
                <div key={index} className="flex gap-2">
                  <Input placeholder="Allowance name" value={earning.name} onChange={(e) => updateEarning(index, 'name', e.target.value)} />
                  <Input type="number" placeholder="Amount" value={earning.amount} onChange={(e) => updateEarning(index, 'amount', Number(e.target.value))} className="w-32" />
                  <Button size="icon" variant="ghost" onClick={() => removeEarning(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {earnings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No earnings added</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Deductions</CardTitle>
              <Button size="sm" variant="outline" onClick={addDeduction}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {deductions.map((deduction, index) => (
                <div key={index} className="flex gap-2">
                  <Input placeholder="Deduction name" value={deduction.name} onChange={(e) => updateDeduction(index, 'name', e.target.value)} />
                  <Input type="number" placeholder="Amount" value={deduction.amount} onChange={(e) => updateDeduction(index, 'amount', Number(e.target.value))} className="w-32" />
                  <Button size="icon" variant="ghost" onClick={() => removeDeduction(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {deductions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No deductions added</p>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Salary Slip Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Salary Slip Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={slipRef} className="bg-white p-8 border-2 border-gray-300 rounded-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
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
                        <span className="px-3 py-1.5 flex-1">{employee ? `${employee.first_name} ${employee.last_name}` : '—'}</span>
                      </div>
                      <div className="flex border border-red-500">
                        <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-32">Designation:</span>
                        <span className="px-3 py-1.5 flex-1">{employee?.position || '—'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex border border-red-500">
                        <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-32">Employee ID:</span>
                        <span className="px-3 py-1.5 flex-1">{employee?.employee_id || '—'}</span>
                      </div>
                      <div className="flex border border-red-500">
                        <span className="font-semibold text-gray-700 bg-red-50 px-3 py-1.5 border-r border-red-500 w-32">Department:</span>
                        <span className="px-3 py-1.5 flex-1">{employee?.department || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Period */}
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
                        <span className="px-3 py-1.5 flex-1">{basicSalary ? Math.round(Number(basicSalary) / 30).toLocaleString() : '0'}</span>
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
                          <tr className="border-b border-red-500">
                            <td className="px-3 py-2">Sick:</td>
                            <td className="text-center px-3 py-2">0</td>
                          </tr>
                          <tr className="border-b border-red-500">
                            <td className="px-3 py-2">Casual:</td>
                            <td className="text-center px-3 py-2">0</td>
                          </tr>
                          <tr className="border-b border-red-500">
                            <td className="px-3 py-2">Annual:</td>
                            <td className="text-center px-3 py-2">0</td>
                          </tr>
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
                          <tr className="border-b border-red-500">
                            <td className="px-3 py-2">Sick:</td>
                            <td className="text-center px-3 py-2">0</td>
                          </tr>
                          <tr className="border-b border-red-500">
                            <td className="px-3 py-2">Casual:</td>
                            <td className="text-center px-3 py-2">0</td>
                          </tr>
                          <tr className="border-b border-red-500">
                            <td className="px-3 py-2">Annual:</td>
                            <td className="text-center px-3 py-2">0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>


                {/* Earnings & Deductions */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-300">Earning & Deductions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Earnings */}
                    <div>
                      <table className="w-full text-sm border border-red-500">
                        <thead>
                          <tr className="bg-red-50 border-b border-red-500">
                            <th className="text-left px-3 py-2 font-semibold text-gray-700">Earning</th>
                            <th className="text-right px-3 py-2 font-semibold text-gray-700">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-red-500">
                            <td className="px-3 py-2">Basic Pay</td>
                            <td className="text-right px-3 py-2">{Number(basicSalary || 0).toLocaleString()}</td>
                          </tr>
                          {earnings.map((e, i) => (
                            <tr key={i} className="border-b border-red-500">
                              <td className="px-3 py-2">{e.name}</td>
                              <td className="text-right px-3 py-2">{Number(e.amount).toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="bg-red-50 font-bold">
                            <td className="px-3 py-2">Gross Salary</td>
                            <td className="text-right px-3 py-2">{totalEarnings.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Deductions */}
                    <div>
                      <table className="w-full text-sm border border-red-500">
                        <thead>
                          <tr className="bg-red-50 border-b border-red-500">
                            <th className="text-left px-3 py-2 font-semibold text-gray-700">Deductions</th>
                            <th className="text-right px-3 py-2 font-semibold text-gray-700">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deductions.map((d, i) => (
                            <tr key={i} className="border-b border-red-500">
                              <td className="px-3 py-2">{d.name}</td>
                              <td className="text-right px-3 py-2">{Number(d.amount).toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="bg-red-50 font-bold">
                            <td className="px-3 py-2">Net Paid</td>
                            <td className="text-right px-3 py-2">{netSalary.toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-red-500">
                            <td className="px-3 py-2">Issuance Date</td>
                            <td className="text-right px-3 py-2 text-xs">{new Date().toLocaleDateString()}</td>
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

                {/* HR KPIs Note */}
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

                {/* Net Salary - Removed as it's now in deductions table */}

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-300">
                  <p>This is a computer-generated salary slip and does not require a signature.</p>
                  <p className="mt-1">For any queries, please contact Human Resource Department</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Company Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                placeholder="Enter company name" 
              />
            </div>
            <div className="space-y-2">
              <Label>Company Address</Label>
              <Input 
                value={companyAddress} 
                onChange={(e) => setCompanyAddress(e.target.value)} 
                placeholder="Enter company address" 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              These details will appear on all salary slips
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={saveCompanyDetails}>Save Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
