import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">About</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="#" className="hover:opacity-100">Our Story</a></li>
              <li><a href="#" className="hover:opacity-100">Team</a></li>
              <li><a href="#" className="hover:opacity-100">Careers</a></li>
            </ul>
          </div>

          {/* Engine */}
          <div>
            <h3 className="font-bold text-lg mb-4">Engine</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="#" className="hover:opacity-100">Internships</a></li>
              <li><a href="#" className="hover:opacity-100">Jobs</a></li>
              <li><a href="#" className="hover:opacity-100">Resume</a></li>
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h3 className="font-bold text-lg mb-4">Guides</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="#" className="hover:opacity-100">Privacy Policy</a></li>
              <li><a href="#" className="hover:opacity-100">Terms of Service</a></li>
              <li><a href="#" className="hover:opacity-100">FAQ</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="#" className="hover:opacity-100">Government Internship</a></li>
              <li><a href="#" className="hover:opacity-100">Government Jobs</a></li>
              <li><a href="#" className="hover:opacity-100">Consultation</a></li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h3 className="font-bold text-lg mb-4">Subscribe</h3>
            <p className="text-sm opacity-90 mb-3">Get latest updates</p>
            <div className="flex gap-2">
              <Input 
                placeholder="Your email" 
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button variant="secondary" size="sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-90">
            Copyright © 2025 internfit.ai — All Rights Reserved
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
