const stats = [
  { number: "20,170", label: "Live Internships" },
  { number: "8,170", label: "Companies" },
  { number: "21,977", label: "Candidates" }
];

const StatsSection = () => {
  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-16 md:gap-24">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-gray-text font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
