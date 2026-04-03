import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Eye, Trash2, DollarSign, Calendar, User } from "lucide-react";
import { payrollApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function PayrollPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: slipsData, isLoading, refetch } = useQuery({
    queryKey: ['salary-slips', selectedMonth, selectedYear],
    queryFn: () => payrollApi.getSalarySlips({ month: selectedMonth, year: selectedYear }),
  });

  const slips = slipsData?.data || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary slip?')) return;
    try {
      await payrollApi.deleteSalarySlip(id);
      toast({ title: "Salary slip deleted" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="text-sm text-muted-foreground">Generate and manage employee salary slips</p>
        </div>
        <Button onClick={() => navigate('/hrms/payroll/generate')} className="gap-2">
          <Plus className="h-4 w-4" /> Generate Salary Slip
        </Button>
      </div>


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Salary Slips</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Salary Slips List */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Slips - {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : slips.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No salary slips found for this period</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/hrms/payroll/generate')}>
                Generate First Slip
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {slips.map((slip: any) => (
                <div key={slip.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{slip.employee_name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {MONTHS.find(m => m.value === slip.month)?.label} {slip.year}
                        </span>
                        <span>{slip.emp_code}</span>
                        <span>{slip.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Net Salary</p>
                      <p className="text-lg font-bold text-green-600">₨ {Number(slip.net_salary).toLocaleString()}</p>
                    </div>
                    <Badge variant={slip.status === 'paid' ? 'default' : 'secondary'}>
                      {slip.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/hrms/payroll/view/${slip.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(slip.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
