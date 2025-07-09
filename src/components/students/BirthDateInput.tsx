
import DatePicker from "@/components/shared/DatePicker";

type BirthDateInputProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string | undefined;
};

const BirthDateInput = ({ value, onChange, error }: BirthDateInputProps) => {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      placeholder="dd/mm/aaaa"
      error={error}
      className="max-w-[200px]"
      dateFormat="dd/MM/yyyy"
    />
  );
};

export default BirthDateInput;
