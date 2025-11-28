type FormFieldProps = {
    name: string;
    label?: string;
    type?: string;
    placeholder?: string;
    control?: any;
    error?: string;
};

const FormField = ({ name, label, type, placeholder, control, error }: FormFieldProps) => {
    return (
        <div data-invalid={!!error} className="group flex flex-col gap-2 w-full font-medium">
            <label htmlFor={name} className="group-data-[invalid=true]:text-destructive">
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                className="border border-gray-300 group-data-[invalid=true]:border-destructive rounded-md p-2 w-full"
            />
            {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
    );
};

export default FormField;
