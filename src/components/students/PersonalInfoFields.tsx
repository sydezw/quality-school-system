
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCPF, formatPhone } from "@/utils/formatters";
import DatePicker from "@/components/shared/DatePicker";
import { Control } from "react-hook-form";
import { StudentFormValues } from "@/lib/validators/student";
import { User, Calendar, CreditCard, Phone, Mail, Sparkles } from "lucide-react";

interface PersonalInfoFieldsProps {
  control: Control<StudentFormValues>;
}

const PersonalInfoFields = ({ control }: PersonalInfoFieldsProps) => {
  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 text-blue-600 mb-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">Dados Pessoais</span>
        </div>
        <p className="text-gray-600 text-sm">Preencha as informações básicas do aluno</p>
      </div>

      {/* Nome - Destaque especial */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
        <FormField
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-bold text-gray-800 flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                Nome Completo *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Digite o nome completo do aluno" 
                  className="h-14 text-lg font-medium border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 bg-white shadow-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Grid de Campos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Data de Nascimento */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="data_nascimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Data de Nascimento
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="dd/mm/aaaa"

                    className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      field.onChange(dateValue ? new Date(dateValue) : null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* CPF */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  CPF
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(formatCPF(e.target.value))}
                    maxLength={14}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Telefone */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  Telefone
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(formatPhone(e.target.value))}
                    maxLength={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="exemplo@email.com"
                    className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoFields;
