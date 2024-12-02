// /components/modules/email/EmailCompose.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Paperclip,
  Image,
  Send,
  X,
  Minimize2,
  Maximize2
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailComposeProps {
  onClose: () => void;
  defaultRecipient?: string;
  defaultSubject?: string;
  defaultContent?: string;
}

export default function EmailCompose({ 
  onClose,
  defaultRecipient = '',
  defaultSubject = '',
  defaultContent = ''
}: EmailComposeProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // TODO: Implement email sending logic
    console.log({
      to: formData.get('to'),
      cc: formData.get('cc'),
      bcc: formData.get('bcc'),
      subject: formData.get('subject'),
      content: formData.get('content'),
      attachments
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "sm:max-w-[600px]",
          isMinimized ? "h-[400px]" : "h-[80vh]"
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>New Message</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
          <div className="space-y-2">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="to">To</Label>
              <Input 
                type="email" 
                id="to" 
                name="to"
                defaultValue={defaultRecipient}
                required 
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="cc">Cc</Label>
              <Input 
                type="email" 
                id="cc" 
                name="cc"
                multiple 
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="bcc">Bcc</Label>
              <Input 
                type="email" 
                id="bcc" 
                name="bcc"
                multiple 
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                type="text" 
                id="subject" 
                name="subject"
                defaultValue={defaultSubject}
                required 
              />
            </div>
          </div>

          <div className="flex-1">
            <Textarea
              className="h-full min-h-[200px]"
              placeholder="Write your message here..."
              name="content"
              defaultValue={defaultContent}
            />
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted p-2 rounded-md"
                >
                  <span className="text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                asChild
              >
                <Label htmlFor="file">
                  <Paperclip className="h-4 w-4" />
                </Label>
              </Button>
              <Input
                id="file"
                type="file"
                className="hidden"
                onChange={handleAttachmentChange}
                multiple
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                asChild
              >
                <Label htmlFor="image">
                  <Image className="h-4 w-4" />
                </Label>
              </Button>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAttachmentChange}
                multiple
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Discard
              </Button>
              <Button type="submit">
                Send
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}