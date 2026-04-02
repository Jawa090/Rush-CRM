import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type DialogType = 'alert' | 'confirm' | 'prompt';

interface DialogOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: string;
  inputType?: string;
  variant?: 'default' | 'destructive';
}

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  message: string;
  options: DialogOptions;
  resolve: (value: any) => void;
}

interface DialogContextType {
  alert: (message: string, options?: DialogOptions) => Promise<void>;
  confirm: (message: string, options?: DialogOptions) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string, options?: DialogOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DialogState | null>(null);
  const [inputValue, setInputValue] = useState('');

  const showDialog = useCallback((type: DialogType, message: string, options: DialogOptions = {}) => {
    return new Promise<any>((resolve) => {
      setState({
        isOpen: true,
        type,
        message,
        options,
        resolve,
      });
      if (type === 'prompt') {
        setInputValue(options.defaultValue || '');
      }
    });
  }, []);

  const handleClose = useCallback(() => {
    if (state) {
      state.resolve(state.type === 'confirm' ? false : state.type === 'prompt' ? null : undefined);
      setState(null);
    }
  }, [state]);

  const handleConfirm = useCallback(() => {
    if (state) {
      state.resolve(state.type === 'confirm' ? true : state.type === 'prompt' ? inputValue : undefined);
      setState(null);
    }
  }, [state, inputValue]);

  const value = React.useMemo(() => ({
    alert: (message: string, options?: DialogOptions) => showDialog('alert', message, options),
    confirm: (message: string, options?: DialogOptions) => showDialog('confirm', message, options),
    prompt: (message: string, defaultValue?: string, options?: DialogOptions) => 
      showDialog('prompt', message, { ...options, defaultValue }),
  }), [showDialog]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      {state && (
        <AlertDialog open={state.isOpen} onOpenChange={(open) => !open && handleClose()}>
          <AlertDialogContent className="sm:max-w-[425px] border-primary/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold tracking-tight">
                {state.options.title || (state.type === 'alert' ? 'Notification' : state.type === 'confirm' ? 'Confirm Action' : 'Input Required')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground pt-2 text-base leading-relaxed">
                {state.message}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {state.type === 'prompt' && (
              <div className="py-4">
                <Input
                  autoFocus
                  type={state.options.inputType || 'text'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirm();
                    if (e.key === 'Escape') handleClose();
                  }}
                  className="w-full focus-visible:ring-primary h-11 text-base border-primary/20"
                  placeholder="Enter value..."
                />
              </div>
            )}

            <AlertDialogFooter className="pt-6 sm:pt-4 flex flex-col-reverse sm:flex-row gap-2">
              {state.type !== 'alert' && (
                <AlertDialogCancel onClick={handleClose} className="mt-0 h-11 px-6 text-base font-medium">
                  {state.options.cancelLabel || 'Cancel'}
                </AlertDialogCancel>
              )}
              <AlertDialogAction
                onClick={handleConfirm}
                className={`h-11 px-8 text-base font-semibold shadow-premium transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  state.options.variant === 'destructive' 
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {state.options.confirmLabel || (state.type === 'alert' ? 'Okay' : 'Confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DialogContext.Provider>
  );
};

export const useCustomDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useCustomDialog must be used within a DialogProvider');
  }
  return context;
};
