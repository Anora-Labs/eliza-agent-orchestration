'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import React, { useState, useEffect } from "react"
import { signInWithGoogle } from "@/lib/api"
import { APP_NAME } from "@/lib/config"
import { createClient } from "@/lib/supabase/client"
import { X } from '@phosphor-icons/react/dist/ssr'
import { UserProfile } from "@/types/user"

type AuthWidgetProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: UserProfile | null;
}

export default function AuthWidget({ isOpen, setIsOpen, user }: AuthWidgetProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const googleIcon = 'https://www.google.com/favicon.ico';

    const supabase = createClient()

    const handleSignInWithGoogle = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Display loading message
            const loadingMessage = "Preparing authentication...";
            console.log(loadingMessage);

            const data = await signInWithGoogle(supabase)

            // Redirect to the provider URL
            if (data?.url) {
                console.log("Redirecting to auth provider:", data.url);
                // Attempt to close the widget before redirect
                setIsOpen(false)
                window.location.href = data.url
            } else {
                setError("No redirect URL received from authentication provider");
            }
        } catch (err: any) {
            console.error("Error signing in with Google:", err)
            setError(err.message || "An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Add an escape key handler to close the modal
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        
        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, [isOpen, setIsOpen]);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 w-full h-full z-50 flex items-center justify-center bg-black/50"
                >
                    <motion.div 
                        className="bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-2xl w-full max-w-xs md:max-w-sm min-w-80 max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-4 space-y-8">
                            {user && (
                                <Button 
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-2 right-2 p-2 hover:bg-accent/50 text-muted-foreground"
                                    aria-label="Close"
                            >
                                    <X size={16} />
                                </Button>
                            )}
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold">{APP_NAME}</h2>
                                <p className="text-sm text-muted-foreground">Sign In to continue...</p>
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                className="w-full flex items-center justify-center gap-2"
                                onClick={handleSignInWithGoogle}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <img src={googleIcon} alt="Google" className="w-4 h-4" />
                                        Continue with Google
                                    </>
                                )}
                            </Button>

                            <p className="text-[10px] text-center text-muted-foreground/80">
                                {isLoading ? 
                                    "You'll be redirected to Google for authentication. After signing in, you'll be returned to the app automatically." 
                                    : 
                                    "By continuing, you agree to our Terms of Service and Privacy Policy"
                                }
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}