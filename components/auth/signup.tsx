"use client";

import React from "react";
import { useActionState, useReducer } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Mail, KeyRound, Eye, EyeClosed, Phone, User, CalendarDays } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TermConditionDialog from "./terms-condition/termConditionDialog";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import { auth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { registerUser, createSessionAndRedirect } from "@/app/auth/actions";

type FormAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "RESET" };

interface FormState {
  firstName: string;
  lastname: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  phoneCountry: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialState: FormState = {
  firstName: "",
  lastname: "",
  birthMonth: "",
  birthDay: "",
  birthYear: "",
  phoneCountry: "+63",
  phoneNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

const countryCodes = [
  { code: "+63", name: "PH (+63)" },
  { code: "+1", name: "US (+1)" },
  { code: "+44", name: "UK (+44)" },
  { code: "+62", name: "ID (+62)" },
  { code: "+65", name: "SG (+65)" },
  { code: "+86", name: "CN (+86)" },
  { code: "+81", name: "JP (+81)" },
  { code: "+82", name: "KR (+82)" },
  { code: "+91", name: "IN (+91)" },
];

const selectClass =
  "bg-gray-800/90 border-gray-700 text-white h-11! w-full rounded-xl focus:ring-1 focus:ring-yellow-400/20 transition-all";

type UIAction =
  | { type: "TOGGLE_PASSWORD" }
  | { type: "TOGGLE_CONFIRM_PASSWORD" }
  | { type: "SET_ACCEPTED_TERMS"; value: boolean }
  | { type: "SET_TERMS_VIEWED" }
  | { type: "SET_DIALOG_OPEN"; value: boolean }
  | { type: "ACCEPT_TERMS_AND_CLOSE" };

const INITIAL_UI = {
  showPassword: false,
  showConfirmPassword: false,
  acceptedTerms: false,
  termsViewed: false,
  dialogOpen: false,
};

function uiReducer(state: typeof INITIAL_UI, action: UIAction) {
  switch (action.type) {
    case "TOGGLE_PASSWORD":
      return { ...state, showPassword: !state.showPassword };
    case "TOGGLE_CONFIRM_PASSWORD":
      return { ...state, showConfirmPassword: !state.showConfirmPassword };
    case "SET_ACCEPTED_TERMS":
      return { ...state, acceptedTerms: action.value };
    case "SET_TERMS_VIEWED":
      return { ...state, termsViewed: true };
    case "SET_DIALOG_OPEN":
      return { ...state, dialogOpen: action.value };
    case "ACCEPT_TERMS_AND_CLOSE":
      return { ...state, acceptedTerms: true, dialogOpen: false };
    default:
      return state;
  }
}

const formatPhone = (digits: string): string => {
  const d = digits.replace(/\D/g, "");
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}`;
};

const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  if (pw.length === 0) return { score: 0, label: "", color: "" };
  if (pw.length < 8) return { score: 1, label: "Too short", color: "bg-red-500" };
  let score = 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  return { score, label: labels[score], color: colors[score] };
};

function BirthdateSelects({
  dataForm,
  dispatch,
}: {
  dataForm: FormState;
  dispatch: React.Dispatch<FormAction>;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="grid grid-cols-[2fr_1fr_1.2fr] gap-2">
      <Select
        value={dataForm.birthMonth}
        onValueChange={(value) => dispatch({ type: "SET_FIELD", field: "birthMonth", value })}
      >
        <SelectTrigger className={selectClass}>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white">
          {months.map((month) => (
            <SelectItem key={month} value={month}>{month}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={dataForm.birthDay}
        onValueChange={(value) => dispatch({ type: "SET_FIELD", field: "birthDay", value })}
      >
        <SelectTrigger className={selectClass}>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white">
          {days.map((day) => (
            <SelectItem key={day} value={day}>{day}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={dataForm.birthYear}
        onValueChange={(value) => dispatch({ type: "SET_FIELD", field: "birthYear", value })}
      >
        <SelectTrigger className={selectClass}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white">
          {years.map((year) => (
            <SelectItem key={year} value={year}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  showPassword,
  toggleShow,
  hasError,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  toggleShow: () => void;
  hasError?: boolean;
}) {
  return (
    <div className="relative group">
      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-yellow-400 transition-colors z-10" />
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className={`pl-10 pr-10 bg-gray-800/90 border-gray-700 text-white placeholder-gray-600 focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 h-11 rounded-xl transition-all ${
          hasError ? "border-red-500/60" : ""
        }`}
      />
      <button
        type="button"
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
        onClick={toggleShow}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function SignUp() {
  const [dataForm, dispatch] = useReducer(formReducer, initialState);

  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; message?: string } | undefined, formData: FormData): Promise<{ error?: string; message?: string }> => {
      const fullName = `${dataForm.firstName} ${dataForm.lastname}`.trim();
      formData.set("fullName", fullName);
      formData.set("phone", `${dataForm.phoneCountry} ${dataForm.phoneNumber}`);
      formData.set("birthMonth", dataForm.birthMonth);
      formData.set("birthDay", dataForm.birthDay);
      formData.set("birthYear", dataForm.birthYear);
      formData.set("email", dataForm.email);
      formData.set("password", dataForm.password);

      const result = await registerUser(formData);
      if (result.error) return { error: result.error };

      try {
        const userCredential = await signInWithEmailAndPassword(auth, dataForm.email, dataForm.password);
        const idToken = await userCredential.user.getIdToken();
        await createSessionAndRedirect(idToken);
      } catch {
        return { message: "Account created. Please sign in." };
      }

      return {};
    },
    undefined,
  );

  const [ui, dispatchUI] = React.useReducer(uiReducer, INITIAL_UI);

  const checkPasswordsMatch = () => dataForm.password === dataForm.confirmPassword;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataForm.email);
  const rawDigits = dataForm.phoneNumber.replace(/\D/g, "");
  const formattedPhone = formatPhone(rawDigits);
  const isValidPhone = !dataForm.phoneNumber || rawDigits.length >= 7;

  const pwStrength = getPasswordStrength(dataForm.password);
  const canSubmit =
    ui.acceptedTerms &&
    !pending &&
    checkPasswordsMatch() &&
    dataForm.password.length >= 8 &&
    isValidEmail &&
    (!dataForm.phoneNumber || isValidPhone) &&
    dataForm.firstName &&
    dataForm.lastname;

  return (
    <Card className="w-full border-gray-800/60 bg-gray-900/60 backdrop-blur-xl shadow-2xl shadow-black/30 rounded-2xl overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400 to-yellow-400/0" />
      <CardHeader className="px-6 pt-5 pb-1">
        <CardTitle className="text-xl font-bold text-white">Create Account</CardTitle>
        <CardDescription className="text-gray-500 text-sm">
          Fill in the details below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-2">
        <form action={action}>
          <div className="flex flex-col gap-4">
            {state?.error && (
              <div className="rounded-xl bg-red-950/50 border border-red-900/50 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                {state.error}
              </div>
            )}
            {state?.message && (
              <div className="rounded-xl bg-green-950/50 border border-green-900/50 px-4 py-3 text-sm text-green-400 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                {state.message}
              </div>
            )}

            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-gray-300">Full Name</Label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-yellow-400 transition-colors z-10" />
                  <Input
                    value={dataForm.firstName}
                    required
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "firstName", value: e.target.value })}
                    placeholder="First"
                    className="pl-10 bg-gray-800/90 border-gray-700 text-white placeholder-gray-600 focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 h-11 rounded-xl transition-all"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={dataForm.lastname}
                    required
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "lastname", value: e.target.value })}
                    placeholder="Last"
                    className="bg-gray-800/90 border-gray-700 text-white placeholder-gray-600 focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 h-11 rounded-xl transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-gray-300">Birthdate</Label>
              <BirthdateSelects dataForm={dataForm} dispatch={dispatch} />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-gray-300">Phone</Label>
              <div className="flex">
                <Select
                  value={dataForm.phoneCountry}
                  onValueChange={(value) => dispatch({ type: "SET_FIELD", field: "phoneCountry", value })}
                >
                  <SelectTrigger className="w-[100px] rounded-l-xl rounded-r-none bg-gray-800/90 border-gray-700 border-r-0 text-white h-11! focus:ring-1 focus:ring-yellow-400/20 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-60">
                    {countryCodes.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1 group">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-400 transition-colors z-10" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formattedPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      dispatch({ type: "SET_FIELD", field: "phoneNumber", value: digits });
                    }}
                    placeholder="968 666 6783"
                    className={`pl-10 rounded-l-none rounded-r-xl bg-gray-800/90 border-gray-700 text-white placeholder-gray-600 focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 h-11 transition-all ${
                      dataForm.phoneNumber && !isValidPhone ? "border-red-500/60" : ""
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-yellow-400 transition-colors z-10" />
                <Input
                  id="email"
                  type="email"
                  value={dataForm.email}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                  placeholder="example@gmail.com"
                  required
                  className={`pl-10 pr-4 bg-gray-800/90 border-gray-700 text-white placeholder-gray-600 focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 h-11 rounded-xl transition-all ${
                    dataForm.email && !isValidEmail ? "border-red-500/60" : ""
                  }`}
                />
              </div>
              {dataForm.email && !isValidEmail && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span className="size-1 rounded-full bg-red-500 shrink-0" />
                  Enter a valid email address
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
              <PasswordInput
                id="password"
                value={dataForm.password}
                onChange={(value) => dispatch({ type: "SET_FIELD", field: "password", value })}
                showPassword={ui.showPassword}
                toggleShow={() => dispatchUI({ type: "TOGGLE_PASSWORD" })}
              />
              {dataForm.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ease-out ${
                          i <= pwStrength.score ? pwStrength.color : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${pwStrength.score <= 1 ? "text-red-400" : "text-gray-500"} flex items-center gap-1`}>
                    <span className={`size-1 rounded-full shrink-0 ${pwStrength.label ? pwStrength.color : "bg-gray-600"}`} />
                    {pwStrength.label}
                    {pwStrength.score >= 2 && pwStrength.score < 4 && (
                      <span className="text-gray-600"> &ndash; add uppercase, number, or symbol</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-300">Confirm Password</Label>
              <PasswordInput
                id="confirm-password"
                value={dataForm.confirmPassword}
                onChange={(value) => dispatch({ type: "SET_FIELD", field: "confirmPassword", value })}
                showPassword={ui.showConfirmPassword}
                toggleShow={() => dispatchUI({ type: "TOGGLE_CONFIRM_PASSWORD" })}
                hasError={!!(dataForm.password && dataForm.confirmPassword && !checkPasswordsMatch())}
              />
              {dataForm.password && dataForm.confirmPassword && !checkPasswordsMatch() && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span className="size-1 rounded-full bg-red-500 shrink-0" />
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 mt-5 p-3 rounded-xl bg-gray-800/30 border border-gray-800/50">
            <Checkbox
              id="terms"
              checked={ui.acceptedTerms}
              onCheckedChange={(checked) => dispatchUI({ type: "SET_ACCEPTED_TERMS", value: !!checked })}
              disabled={!ui.termsViewed}
              className="mt-0.5 border-gray-600 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400 data-[state=checked]:text-black shrink-0"
            />
            <Label htmlFor="terms" className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed cursor-pointer select-none">
              I have read and agree to the{" "}
              <Dialog
                open={ui.dialogOpen}
                onOpenChange={(open) => {
                  dispatchUI({ type: "SET_DIALOG_OPEN", value: open });
                  if (open) dispatchUI({ type: "SET_TERMS_VIEWED" });
                }}
              >
                <DialogTrigger asChild>
                  <button type="button" className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2 transition-colors font-medium">
                    Terms and Conditions
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white p-6 rounded-2xl max-w-2xl w-[95vw]">
                  <TermConditionDialog
                    onAccept={() => dispatchUI({ type: "ACCEPT_TERMS_AND_CLOSE" })}
                  />
                </DialogContent>
              </Dialog>
            </Label>
          </div>

          <CardFooter className="px-0 pb-0 pt-4">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-11 rounded-xl text-black font-semibold bg-yellow-400 hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-400/20 disabled:bg-gray-700 disabled:text-gray-400 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

export default SignUp;
