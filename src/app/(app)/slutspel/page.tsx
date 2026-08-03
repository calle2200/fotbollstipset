import { redirect } from "next/navigation";

// Slutspel bor nu som en flik under Mitt tips. Behåll rutten som omdirigering
// så gamla länkar/bokmärken fortsätter fungera.
export default function SlutspelRedirect() {
  redirect("/mitt-tips?del=slutspel");
}
