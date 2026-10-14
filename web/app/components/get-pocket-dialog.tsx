import { useState } from "react"
import { ArrowUpRight, Download, ShieldCheck, Smartphone } from "lucide-react"
import { buttonVariants } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { ANDROID_APK_UPDATED, ANDROID_APK_URL } from "~/lib/app-links"
import { cn } from "~/lib/utils"

const STEPS = [
  "Download the APK on your Android phone.",
  "Open it and allow “Install unknown apps” if Android asks.",
  "Open Pocket and tap Try Demo, or Create my Pocket with your fingerprint.",
]

/** "Get Pocket" → dialog with install steps → Download APK. */
export function GetPocketDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>
        Get Pocket <ArrowUpRight size={20} aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="size-5" aria-hidden="true" />
            Download Pocket for Android
          </DialogTitle>
          <DialogDescription>
            Pocket installs directly from an APK while it&apos;s in early
            access. Here&apos;s how:
          </DialogDescription>
        </DialogHeader>

        <ol className="grid gap-2 text-sm">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Your keys stay on your phone: Pocket uses a passkey, not a seed
          phrase, and no server ever holds your money. Build updated{" "}
          {ANDROID_APK_UPDATED}.
        </p>

        <DialogFooter>
          <DialogClose className={buttonVariants({ variant: "outline" })}>
            Not now
          </DialogClose>
          <a
            href={ANDROID_APK_URL}
            onClick={() => setOpen(false)}
            className={cn(buttonVariants(), "gap-2")}
            rel="noopener"
          >
            <Download className="size-4" aria-hidden="true" />
            Download APK
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
