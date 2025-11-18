import { Upload } from "lucide-react";
import ResumeUploadDialog from "./ResumeUploadDialog";

const ResumeUpload = () => {
  return (
    <section className="w-full py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Circle Icon */}
          <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <Upload className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          {/* CTA Button */}
          <ResumeUploadDialog />

          {/* Subtitle */}
          <p className="text-gray-text">
            Upload your CV/Resume and get personalized AI-based internship recommendations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResumeUpload;
