"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/hooks/use-user";
import {
  updateUsername,
  updateEmail,
  updatePassword,
} from "@/src/lib/auth";
import { deleteAccountAction } from "@/src/lib/actions/account";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { User, Mail, KeyRound, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useUser();

  // Form states
  const [username, setUsername] = useState<string>("");
  const [usernameSaving, setUsernameSaving] = useState<boolean>(false);
  const [usernameMessage, setUsernameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [email, setEmail] = useState<string>("");
  const [emailSaving, setEmailSaving] = useState<boolean>(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordSaving, setPasswordSaving] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Danger zone state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync and reset form states whenever user changes
  useEffect(() => {
    if (user) {
      setUsername((user.user_metadata?.username as string) || "");
      setEmail(user.email || "");
      setPassword("");
      setConfirmPassword("");
      setUsernameMessage(null);
      setEmailMessage(null);
      setPasswordMessage(null);
      setDeleteDialogOpen(false);
      setDeleteConfirmText("");
      setDeleteError(null);
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUsernameMessage(null);
      setEmailMessage(null);
      setPasswordMessage(null);
      setDeleteDialogOpen(false);
      setDeleteConfirmText("");
      setDeleteError(null);
    }
  }, [user?.id, user?.email, user?.user_metadata?.username]);

  const handleOpenDeleteDialog = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setDeleteConfirmText("");
      setDeleteError(null);
    }
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUsernameSaving(true);
    setUsernameMessage(null);

    try {
      await updateUsername(user.id, username);
      setUsernameMessage({ type: "success", text: "Username updated successfully!" });
    } catch (err: any) {
      setUsernameMessage({ type: "error", text: err.message || "Failed to update username." });
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEmailSaving(true);
    setEmailMessage(null);

    try {
      await updateEmail(user.id, email);
      setEmailMessage({
        type: "success",
        text: "Email update requested! Check your new email inbox for a confirmation link.",
      });
    } catch (err: any) {
      setEmailMessage({ type: "error", text: err.message || "Failed to update email." });
    } finally {
      setEmailSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      await updatePassword(password);
      setPasswordMessage({ type: "success", text: "Password reset successfully!" });
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to reset password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Please type DELETE to confirm account deletion.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccountAction();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal profile, email address, password, and account settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Username Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="size-5 text-primary" />
              Username Profile
            </CardTitle>
            <CardDescription>
              Update your display username used across ReviewTrail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={usernameSaving}
                  required
                />
              </div>

              {usernameMessage && (
                <div
                  className={`text-xs flex items-center gap-1.5 p-3 rounded-lg ${
                    usernameMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {usernameMessage.type === "success" && <CheckCircle2 className="size-4 shrink-0" />}
                  <span>{usernameMessage.text}</span>
                </div>
              )}

              <Button type="submit" disabled={usernameSaving} size="sm">
                {usernameSaving && <Loader2 className="size-4 animate-spin mr-2" />}
                Save Username
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Email Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              Email Address
            </CardTitle>
            <CardDescription>
              Update the email address associated with your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailSaving}
                  required
                />
              </div>

              {emailMessage && (
                <div
                  className={`text-xs flex items-center gap-1.5 p-3 rounded-lg ${
                    emailMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {emailMessage.type === "success" && <CheckCircle2 className="size-4 shrink-0" />}
                  <span>{emailMessage.text}</span>
                </div>
              )}

              <Button type="submit" disabled={emailSaving} size="sm">
                {emailSaving && <Loader2 className="size-4 animate-spin mr-2" />}
                Update Email
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Reset Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Password & Security
            </CardTitle>
            <CardDescription>
              Change or reset your login password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={passwordSaving}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordSaving}
                  required
                  minLength={6}
                />
              </div>

              {passwordMessage && (
                <div
                  className={`text-xs flex items-center gap-1.5 p-3 rounded-lg ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {passwordMessage.type === "success" && <CheckCircle2 className="size-4 shrink-0" />}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <Button type="submit" disabled={passwordSaving} size="sm">
                {passwordSaving && <Loader2 className="size-4 animate-spin mr-2" />}
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Permanently delete your ReviewTrail account and all associated exam trackers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={handleOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your saved review trackers, checklists, and progress will be deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-bold text-foreground">DELETE</span> to confirm:
            </Label>
            <Input
              id="delete-confirm"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={deleting}
            />

            {deleteError && (
              <p className="text-xs text-destructive">{deleteError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
            >
              {deleting && <Loader2 className="size-4 animate-spin mr-2" />}
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
