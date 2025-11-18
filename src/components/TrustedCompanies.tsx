const companies = [
  { name: "TCS", logo: "TCS" },
  { name: "Infosys", logo: "Infosys" },
  { name: "Wipro", logo: "Wipro" },
  { name: "HCL", logo: "HCL" },
  { name: "Tech Mahindra", logo: "Tech M" },
  { name: "Government of India", logo: "GoI" },
  { name: "BSNL", logo: "BSNL" },
  { name: "TRAI", logo: "TRAI" }
];

const TrustedCompanies = () => {
  return (
    <section className="w-full py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Trusted by 100+ world's best companies
          </h2>
          <p className="text-gray-text">& government organizations</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {companies.map((company, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center p-6 bg-muted/30 rounded-lg hover:shadow-md transition-shadow"
            >
              <span className="text-xl font-bold text-gray-text">{company.logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;
