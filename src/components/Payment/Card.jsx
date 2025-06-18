export const PaymentCard = ({ title, description, icons = [], buttonText, onPay }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md w-full max-w-sm">
      <div className="p-5">
        <h3 className="text-xl font-bold text-black">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>

        {icons.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {icons.map((icon, i) => (
              <img key={i} src={icon} alt="icon" className="h-6" />
            ))}
          </div>
        )}
      </div>

      <div onClick={onPay} className="bg-black text-white px-5 py-3 flex justify-between items-center rounded-b-xl cursor-pointer hover:opacity-90 transition">
        <span className="font-semibold text-base">{buttonText}</span>
        <span className="text-2xl">→</span>
      </div>
    </div>
  );
};
