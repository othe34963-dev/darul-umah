import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Calendar,
  User,
  BookOpen,
  FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { makeAuthenticatedRequest } from "@/lib/api";
import { 
  Fee, 
  CreateFeeRequest, 
  UpdateFeeRequest, 
  FeesResponse, 
  StudentOption,
  ClassOption,
  BulkGenerateFeesRequest,
  BulkGenerateFeesResponse,
  FeeType,
  FeeStatus 
} from "@shared/api";

// Form validation schemas
const createFeeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  feeType: z.enum(["TUITION", "EXAM", "LIBRARY", "TRANSPORT", "HOSTEL", "UNIFORM", "BOOKS", "OTHER"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

const updateFeeSchema = createFeeSchema.partial();

const bulkGenerateSchema = z.object({
  classIds: z.array(z.string()).min(1, "At least one class must be selected"),
  feeType: z.enum(["TUITION", "EXAM", "LIBRARY", "TRANSPORT", "HOSTEL", "UNIFORM", "BOOKS", "OTHER"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

type CreateFeeForm = z.infer<typeof createFeeSchema>;
type UpdateFeeForm = z.infer<typeof updateFeeSchema>;
type BulkGenerateForm = z.infer<typeof bulkGenerateSchema>;

// Fee type options
const feeTypeOptions: { value: FeeType; label: string; icon: React.ReactNode }[] = [
  { value: "TUITION", label: "Tuition", icon: <BookOpen className="h-4 w-4" /> },
  { value: "EXAM", label: "Exam", icon: <BookOpen className="h-4 w-4" /> },
  { value: "LIBRARY", label: "Library", icon: <BookOpen className="h-4 w-4" /> },
  { value: "TRANSPORT", label: "Transport", icon: <BookOpen className="h-4 w-4" /> },
  { value: "HOSTEL", label: "Hostel", icon: <BookOpen className="h-4 w-4" /> },
  { value: "UNIFORM", label: "Uniform", icon: <BookOpen className="h-4 w-4" /> },
  { value: "BOOKS", label: "Books", icon: <BookOpen className="h-4 w-4" /> },
  { value: "OTHER", label: "Other", icon: <BookOpen className="h-4 w-4" /> },
];

// Status badge component
const StatusBadge: React.FC<{ status: FeeStatus }> = ({ status }) => {
  const variants = {
    PAID: "bg-green-100 text-green-800 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    OVERDUE: "bg-red-100 text-red-800 border-red-200",
    WAIVED: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const icons = {
    PAID: <CheckCircle className="h-3 w-3" />,
    PENDING: <Clock className="h-3 w-3" />,
    OVERDUE: <AlertTriangle className="h-3 w-3" />,
    WAIVED: <CheckCircle className="h-3 w-3" />,
  };

  return (
    <Badge variant="outline" className={`${variants[status]} flex items-center gap-1`}>
      {icons[status]}
      {status}
    </Badge>
  );
};

// Summary cards component
const SummaryCards: React.FC<{ summary: FeesResponse["summary"] }> = ({ summary }) => {
  const cards = [
    {
      title: "Total Paid",
      value: `$${summary.totalPaid.toLocaleString()}`,
      count: summary.paidCount,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      bgColor: "bg-green-50 border-green-200",
    },
    {
      title: "Total Pending",
      value: `$${summary.totalPending.toLocaleString()}`,
      count: summary.pendingCount,
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      bgColor: "bg-yellow-50 border-yellow-200",
    },
    {
      title: "Total Overdue",
      value: `$${summary.totalOverdue.toLocaleString()}`,
      count: summary.overdueCount,
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      bgColor: "bg-red-50 border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.count} students</p>
              </div>
              <div className="p-3 bg-white rounded-full">
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Bulk Fee Generation Dialog
const BulkFeeDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
}> = ({ open, onOpenChange, classes }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BulkGenerateForm>({
    resolver: zodResolver(bulkGenerateSchema),
    defaultValues: {
      classIds: [],
      feeType: "TUITION",
      amount: 0,
      dueDate: "",
      notes: "",
    },
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: async (data: BulkGenerateFeesRequest) => {
      const response = await makeAuthenticatedRequest("/api/fees/bulk-generate", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response) throw new Error("Authentication failed");
      return response.json();
    },
    onSuccess: (data: BulkGenerateFeesResponse) => {
      toast({ 
        title: "Success", 
        description: `Successfully generated ${data.createdCount} fees for ${data.fees.length} students` 
      });
      if (data.errors && data.errors.length > 0) {
        toast({ 
          title: "Some errors occurred", 
          description: `${data.errors.length} errors during generation`,
          variant: "destructive" 
        });
      }
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: BulkGenerateForm) => {
    bulkGenerateMutation.mutate({
      feeType: data.feeType || "TUITION",
      amount: data.amount || 0,
      dueDate: data.dueDate || "",
      notes: data.notes || "",
      classIds: data.classIds || []
    });
  };

  // Quick monthly tuition generation
  const generateMonthlyTuition = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const dueDate = nextMonth.toISOString().split('T')[0];
    
    form.setValue('classIds', classes.map(cls => cls.id));
    form.setValue('feeType', 'TUITION');
    form.setValue('amount', 500); // Default monthly tuition
    form.setValue('dueDate', dueDate);
    form.setValue('notes', `Monthly tuition for ${nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
  };

  const selectedClasses = classes.filter(cls => form.watch("classIds").includes(cls.id));
  const totalStudents = selectedClasses.reduce((sum, cls) => sum + cls.studentCount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Generate Fees</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="classIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Classes</FormLabel>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                    {classes.map((cls) => (
                      <div key={cls.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={cls.id}
                          checked={field.value.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, cls.id]);
                            } else {
                              field.onChange(field.value.filter((id: string) => id !== cls.id));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={cls.id} className="flex-1 text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium">{cls.name}</span>
                            <span className="text-gray-500">{cls.studentCount} students</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {cls.subject} - {cls.teacher.name}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feeTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {totalStudents > 0 && (
              <div className="bg-blue-50 p-2 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>Summary:</strong> This will generate fees for {totalStudents} students across {selectedClasses.length} classes.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateMonthlyTuition}
                className="flex-1 text-xs"
              >
                Quick Monthly Tuition
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={bulkGenerateMutation.isPending || totalStudents === 0}>
                {bulkGenerateMutation.isPending ? "Generating..." : `Generate Fees (${totalStudents} students)`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Add/Edit Fee Dialog
const FeeDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee?: Fee;
  students: StudentOption[];
}> = ({ open, onOpenChange, fee, students }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!fee;

  const form = useForm<CreateFeeForm>({
    resolver: zodResolver(isEditing ? updateFeeSchema : createFeeSchema),
    defaultValues: {
      studentId: fee?.studentId || "",
      feeType: fee?.feeType || "TUITION",
      amount: fee?.amount || 0,
      dueDate: fee?.dueDate ? format(new Date(fee.dueDate), "yyyy-MM-dd") : "",
      notes: fee?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateFeeRequest) => {
      const response = await makeAuthenticatedRequest("/api/fees", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response) throw new Error("Authentication failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Fee created successfully" });
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateFeeRequest) => {
      const response = await makeAuthenticatedRequest(`/api/fees/${fee?.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response) throw new Error("Authentication failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Fee updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: CreateFeeForm) => {
    const selectedStudent = students.find(s => s.id === data.studentId);
    if (!selectedStudent) {
      toast({ title: "Error", description: "Please select a valid student", variant: "destructive" });
      return;
    }

    const feeData = {
      ...data,
      academicYearId: selectedStudent.academicYear.id,
    };

    if (isEditing) {
      updateMutation.mutate(feeData);
    } else {
      createMutation.mutate({
        studentId: feeData.studentId || "",
        academicYearId: feeData.academicYearId,
        feeType: feeData.feeType || "TUITION",
        amount: feeData.amount || 0,
        dueDate: feeData.dueDate || "",
        notes: feeData.notes || ""
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Fee" : "Add New Fee"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{student.name} ({student.studentId}) - {student.className}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feeTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditing ? "Update Fee" : "Add Fee"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Main Fees Management Component
const Fees: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "ALL">("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | undefined>();

  // Fetch fees
  const { data: feesData, isLoading } = useQuery<FeesResponse>({
    queryKey: ["fees", page, search, statusFilter, classFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(classFilter !== "ALL" && { classId: classFilter }),
        sortBy,
        sortOrder,
      });
      const response = await makeAuthenticatedRequest(`/api/fees?${params}`);
      if (!response) throw new Error("Authentication failed");
      return response.json();
    },
  });

  // Fetch students for dropdown
  const { data: students = [] } = useQuery<StudentOption[]>({
    queryKey: ["fees-students"],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest("/api/fees/students");
      if (!response) throw new Error("Authentication failed");
      return response.json();
    },
  });

  // Fetch classes for bulk generation
  const { data: classes = [] } = useQuery<ClassOption[]>({
    queryKey: ["fees-classes"],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest("/api/fees/classes");
      if (!response) throw new Error("Authentication failed");
      return response.json();
    },
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async (feeId: string) => {
      const response = await makeAuthenticatedRequest(`/api/fees/${feeId}/paid`, {
        method: "PATCH",
      });
      if (!response) throw new Error("Authentication failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Fee marked as paid successfully" });
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (feeId: string) => {
      const response = await makeAuthenticatedRequest(`/api/fees/${feeId}`, {
        method: "DELETE",
      });
      if (!response) throw new Error("Authentication failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Fee deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });


  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    setDialogOpen(true);
  };

  // Export pending fees as PDF
  const handleExportPendingFees = () => {
    if (!feesData?.fees) return;
    
    const pendingFees = feesData.fees.filter(fee => fee.status === "PENDING");
    if (pendingFees.length === 0) {
      toast({ title: "No Data", description: "No pending fees to export", variant: "destructive" });
      return;
    }

    // Group by class for better organization
    const feesByClass = pendingFees.reduce((acc, fee) => {
      const className = fee.student.className;
      if (!acc[className]) acc[className] = [];
      acc[className].push(fee);
      return acc;
    }, {} as Record<string, Fee[]>);

    // Create PDF content
    const pdfContent = Object.entries(feesByClass).map(([className, fees]) => {
      const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
      return {
        class: className,
        fees: fees,
        totalAmount: totalAmount,
        count: fees.length
      };
    });

    // Generate PDF (simplified version)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pending Fees Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .class-section { margin-bottom: 30px; page-break-inside: avoid; }
              .class-title { background: #f0f0f0; padding: 10px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { font-weight: bold; background: #e8f4fd; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Darul Ummah School</h1>
              <h2>Pending Fees Report</h2>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${pdfContent.map(section => `
              <div class="class-section">
                <div class="class-title">
                  ${section.class} - ${section.count} students - Total: $${section.totalAmount.toLocaleString()}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Fee Type</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${section.fees.map(fee => `
                      <tr>
                        <td>${fee.student.name}</td>
                        <td>${fee.student.studentId}</td>
                        <td>${fee.feeType}</td>
                        <td>$${fee.amount.toLocaleString()}</td>
                        <td>${format(new Date(fee.dueDate), "MMM dd, yyyy")}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
            
            <div class="total" style="margin-top: 30px; padding: 15px; text-align: center;">
              <h3>Total Pending Fees: $${pendingFees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString()}</h3>
              <p>Total Students: ${pendingFees.length}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast({ title: "Success", description: "Pending fees report generated for printing" });
  };

  const handleDelete = (fee: Fee) => {
    if (window.confirm(`Are you sure you want to delete this fee for ${fee.student.name}?`)) {
      deleteMutation.mutate(fee.id);
    }
  };

  const handleMarkAsPaid = (fee: Fee) => {
    if (window.confirm(`Mark fee as paid for ${fee.student.name}?`)) {
      markAsPaidMutation.mutate(fee.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading fees...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
            <p className="text-gray-600">Manage student fees, payments, and receipts</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleExportPendingFees()}
              disabled={!feesData?.fees.some(f => f.status === "PENDING")}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export Pending PDF
            </Button>
            <Button onClick={() => setBulkDialogOpen(true)} variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Bulk Generate
            </Button>
            <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Fee
            </Button>
          </div>
        </div>

        {feesData?.summary && <SummaryCards summary={feesData.summary} />}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by student name, ID, or class..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value: FeeStatus | "ALL") => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="WAIVED">Waived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="student">Student Name</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fees Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Fees ({feesData?.pagination.total || 0} total)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feesData?.fees.map((fee) => (
                    <TableRow key={fee.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{fee.student.name}</p>
                            <p className="text-sm text-gray-500">{fee.student.studentId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{fee.student.className}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {feeTypeOptions.find(opt => opt.value === fee.feeType)?.icon}
                          <span>{feeTypeOptions.find(opt => opt.value === fee.feeType)?.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${fee.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(fee.dueDate), "MMM dd, yyyy")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={fee.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {fee.status !== "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsPaid(fee)}
                              disabled={markAsPaidMutation.isPending}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(fee)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(fee)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {feesData?.pagination && feesData.pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing {((feesData.pagination.page - 1) * feesData.pagination.limit) + 1} to{" "}
                  {Math.min(feesData.pagination.page * feesData.pagination.limit, feesData.pagination.total)} of{" "}
                  {feesData.pagination.total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === feesData.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Fee Dialog */}
        <FeeDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingFee(undefined);
          }}
          fee={editingFee}
          students={students}
        />

        {/* Bulk Fee Generation Dialog */}
        <BulkFeeDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          classes={classes}
        />
      </div>
    </DashboardLayout>
  );
};

export default Fees;
