import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Wrench, CheckCircle2, DollarSign, MapPin, Loader2 } from "lucide-react";

import { useSubmitLead } from "@workspace/api-client-react";
import { LeadInputYear, LeadInputModel } from "@workspace/api-client-react";
import { leadFormSchema, type LeadFormValues } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// @ts-ignore
import heroAtv from "@/assets/hero-atv.png";
// @ts-ignore
import partsAtv from "@/assets/parts-atv.png";

export default function Home() {
  const { toast } = useToast();
  const submitLead = useSubmitLead();
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      condition: "",
      askingPrice: "",
      notes: "",
    },
  });

  function onSubmit(data: LeadFormValues) {
    submitLead.mutate(
      { data },
      {
        onSuccess: () => {
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast({
            title: "Info sent.",
            description: "I'll be in touch shortly.",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Something went wrong.",
            description: "Could not send your information. Please try again.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark selection:bg-primary selection:text-black">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-display text-xl tracking-wider text-primary">250R BUYER</div>
          <Button variant="default" className="font-display tracking-widest uppercase text-black" onClick={() => document.getElementById('sell-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Sell Yours
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 container mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl leading-none text-white"
          >
            I BUY <span className="text-primary block">HONDA 250R'S.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-sans"
          >
            Looking for 1985 & 1986 ATC 250R and TRX 250R. Running, wrecked, in boxes, or rusting in the barn — I pay fair cash.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Button size="lg" className="text-lg h-14 px-8 font-display tracking-wider text-black bg-primary hover:bg-primary/90" onClick={() => document.getElementById('sell-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Get a Cash Offer
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8 font-display tracking-wider" onClick={() => document.getElementById('what-i-buy')?.scrollIntoView({ behavior: 'smooth' })}>
              What I Buy
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 w-full"
        >
          <div className="relative aspect-video lg:aspect-[4/3] w-full border-4 border-secondary overflow-hidden bg-secondary">
            {heroAtv ? (
              <img src={heroAtv} alt="Vintage ATC 250R" className="w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-700" />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">Image loading...</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent mix-blend-multiply" />
          </div>
        </motion.div>
      </section>

      {/* What I Buy */}
      <section id="what-i-buy" className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl text-white">ANY CONDITION. <span className="text-primary">SERIOUSLY.</span></h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              I'm not a dealership looking for showroom queens. I'm a private buyer who knows what these machines are and what they're worth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-border bg-background hover:border-primary transition-colors">
              <CheckCircle2 className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl text-white mb-4">Clean & Running</h3>
              <p className="text-muted-foreground">
                Got a nice survivor? I'll pay top dollar for clean, running 85/86 machines. No lowballing.
              </p>
            </div>
            
            <div className="p-8 border border-border bg-background hover:border-primary transition-colors">
              <Wrench className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl text-white mb-4">Blown & Busted</h3>
              <p className="text-muted-foreground">
                Motor locked up? Missing plastics? Left outside for 10 years? I still want it.
              </p>
            </div>
            
            <div className="p-8 border border-border bg-background hover:border-primary transition-colors">
              <MapPin className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl text-white mb-4">Parts & Rollers</h3>
              <p className="text-muted-foreground">
                Just a frame and some wheels? Boxes of motor parts? I buy incomplete projects too.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Machines */}
      <section className="py-24 border-y border-border">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 w-full order-2 lg:order-1">
            <div className="relative aspect-video w-full border-4 border-secondary overflow-hidden bg-secondary">
              {partsAtv ? (
                <img src={partsAtv} alt="ATV Parts" className="w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-700" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">Image loading...</div>
              )}
            </div>
          </div>
          
          <div className="flex-1 order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl text-white mb-8">THE BIKES I WANT</h2>
            <ul className="space-y-6 text-xl font-sans text-muted-foreground">
              <li className="flex items-start gap-4">
                <span className="text-primary font-display text-2xl">01</span>
                <div>
                  <strong className="text-white block font-display tracking-wide uppercase">1985 Honda ATC 250R</strong>
                  The legend. Liquid cooled, 6-speed, Pro-Link.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-display text-2xl">02</span>
                <div>
                  <strong className="text-white block font-display tracking-wide uppercase">1986 Honda ATC 250R</strong>
                  The final year of the three-wheeler.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-display text-2xl">03</span>
                <div>
                  <strong className="text-white block font-display tracking-wide uppercase">1986 Honda TRX 250R</strong>
                  The beginning of the four-wheeler era.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="sell-form" className="py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-3xl">
          {submitted ? (
            <div className="bg-background border border-primary p-12 text-center">
              <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
              <h2 className="text-4xl text-white mb-4">GOT IT.</h2>
              <p className="text-xl text-muted-foreground font-sans">
                Thanks for reaching out. I'll take a look at what you have and give you a call or text shortly.
              </p>
              <Button 
                className="mt-8 font-display tracking-widest text-black" 
                onClick={() => setSubmitted(false)}
              >
                Submit Another
              </Button>
            </div>
          ) : (
            <div className="bg-background border border-border p-8 md:p-12">
              <div className="mb-10 text-center">
                <h2 className="text-4xl md:text-5xl text-white">TELL ME WHAT YOU GOT</h2>
                <p className="mt-4 text-muted-foreground font-sans">
                  Fill out the details. I'll get back to you with a cash offer or questions.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-display tracking-wider uppercase">Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-secondary border-border rounded-none h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-display tracking-wider uppercase">Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 555-5555" className="bg-secondary border-border rounded-none h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-display tracking-wider uppercase">Location (City, State) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Phoenix, AZ" className="bg-secondary border-border rounded-none h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-display tracking-wider uppercase">Year *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-secondary border-border rounded-none h-12">
                                <SelectValue placeholder="Select Year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none bg-background border-border">
                              <SelectItem value={LeadInputYear.NUMBER_1985}>1985</SelectItem>
                              <SelectItem value={LeadInputYear.NUMBER_1986}>1986</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-display tracking-wider uppercase">Model *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-secondary border-border rounded-none h-12">
                                <SelectValue placeholder="Select Model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none bg-background border-border">
                              <SelectItem value={LeadInputModel.ATC_250R}>ATC 250R (3-Wheeler)</SelectItem>
                              <SelectItem value={LeadInputModel.TRX_250R}>TRX 250R (4-Wheeler)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-display tracking-wider uppercase">Condition *</FormLabel>
                        <FormDescription className="text-muted-foreground/80">Be honest. Does it run? Missing parts? Bent frame?</FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="Motor is locked up, missing rear fenders, been sitting in barn since 2005..." 
                            className="bg-secondary border-border rounded-none min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="askingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-display tracking-wider uppercase">Asking Price (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="$2500" className="bg-secondary border-border rounded-none h-12" {...field} value={field.value || ''} />
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
                        <FormLabel className="text-white font-display tracking-wider uppercase">Other Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any extra parts? Aftermarket stuff?" 
                            className="bg-secondary border-border rounded-none min-h-[80px]" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-16 text-xl font-display tracking-widest uppercase text-black bg-primary hover:bg-primary/90 rounded-none"
                    disabled={submitLead.isPending}
                  >
                    {submitLead.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      "SUBMIT DETAILS"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background text-center">
        <div className="container mx-auto px-4">
          <div className="font-display text-2xl text-primary mb-4">250R BUYER</div>
          <p className="text-muted-foreground font-sans uppercase tracking-widest text-sm">
            Buying 1985 & 1986 Honda ATC/TRX 250R
          </p>
        </div>
      </footer>
    </div>
  );
}
