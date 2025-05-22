
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Music, Users, Building2, User } from "lucide-react";
import { UserRole, useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  role: z.enum(["dj", "promoter", "venue", "fan"], {
    required_error: "Please select a role.",
  }),
});

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUp() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "fan",
    },
  });

  function onSubmit(values: SignUpFormValues) {
    setIsSubmitting(true);

    // In a real app, we would send this data to a server
    setTimeout(() => {
      // Mock user creation
      const newUser = {
        id: Date.now().toString(),
        name: values.name,
        username: values.username,
        avatar: "/placeholder.svg",
        role: values.role as UserRole,
      };

      // Set current user in auth context
      setCurrentUser(newUser);

      toast({
        title: "Account created successfully!",
        description: `Welcome to NightFlow, ${values.name}!`,
      });

      // Redirect based on role
      if (values.role === "fan") {
        navigate("/discover");
      } else if (values.role === "dj") {
        navigate("/dj-dashboard");
      } else if (values.role === "promoter") {
        navigate("/promoter-dashboard");
      } else {
        navigate("/venue-dashboard");
      }

      setIsSubmitting(false);
    }, 1000);
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Join NightFlow</h1>
        <p className="text-muted-foreground">
          Sign up to discover events, follow DJs, and connect with the nightlife scene
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormDescription>
                  This will be your public @username
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>What best describes you?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <FormItem>
                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent cursor-pointer [&:has([data-state=checked])]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="dj" className="sr-only" />
                        </FormControl>
                        <Music className="h-6 w-6 mb-2" />
                        <div className="space-y-1">
                          <p className="text-base">DJ</p>
                          <p className="text-xs text-muted-foreground">
                            I perform at events
                          </p>
                        </div>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent cursor-pointer [&:has([data-state=checked])]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="promoter" className="sr-only" />
                        </FormControl>
                        <Users className="h-6 w-6 mb-2" />
                        <div className="space-y-1">
                          <p className="text-base">Promoter</p>
                          <p className="text-xs text-muted-foreground">
                            I organize events
                          </p>
                        </div>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent cursor-pointer [&:has([data-state=checked])]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="venue" className="sr-only" />
                        </FormControl>
                        <Building2 className="h-6 w-6 mb-2" />
                        <div className="space-y-1">
                          <p className="text-base">Venue</p>
                          <p className="text-xs text-muted-foreground">
                            I represent a venue
                          </p>
                        </div>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent cursor-pointer [&:has([data-state=checked])]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="fan" className="sr-only" />
                        </FormControl>
                        <User className="h-6 w-6 mb-2" />
                        <div className="space-y-1">
                          <p className="text-base">Fan</p>
                          <p className="text-xs text-muted-foreground">
                            I attend events
                          </p>
                        </div>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Button variant="link" className="p-0" onClick={() => navigate("/")}>
          Sign in
        </Button>
      </p>
    </div>
  );
}
