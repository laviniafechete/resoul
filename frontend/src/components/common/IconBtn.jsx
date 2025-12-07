export default function IconBtn({
  text,
  onclick,
  children,
  disabled,
  outline = false,
  customClasses,
  type,
}) {
  return (
    <button
      disabled={disabled}
      onClick={onclick}
      className={`flex items-center justify-center outline-none ${
        outline
          ? "border border-brand-primary bg-transparent"
          : "bg-brand-primary"
      } cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-white hover:scale-95 duration-300 ${customClasses}`}
      type={type}
    >
      {children ? (
        <>
          <span className={`${outline && "text-brand-primary"}`}>{text}</span>
          {children}
        </>
      ) : (
        text
      )}
    </button>
  );
}
