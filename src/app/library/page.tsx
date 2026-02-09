"use client"

import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen, Calendar, Tag } from "lucide-react"
import { useTranslation } from "@/lib/language-context"
import Link from "next/link"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

export default function LibraryPage() {
  const { t } = useTranslation()
  const questions = useQuery(api.questions.getUserQuestions)

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <SignedOut>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-3xl font-bold">Frågebibliotek</h2>
          <p className="max-w-md text-lg text-muted-foreground">
            Logga in för att se dina sparade frågor
          </p>
          <SignInButton mode="modal">
            <Button size="lg">Logga in</Button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Frågebibliotek</h1>
              <p className="text-muted-foreground mt-2">
                Dina sparade frågor från tidigare generationer
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Skapa nya frågor</Button>
            </Link>
          </div>

          {questions === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Inga sparade frågor än</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Skapa och spara frågor från huvudsidan för att se dem här
                </p>
                <Link href="/">
                  <Button>Skapa frågor</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {questions.map((question) => (
                <Card key={question._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {question.title}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap gap-2 items-center">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {question.subject}
                          </span>
                          {question.tags && question.tags.length > 0 && (
                            <>
                              {question.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={
                          question.type === "mcq" ? "default" :
                          question.type === "true_false" ? "secondary" :
                          "outline"
                        }>
                          {question.type === "mcq" ? "Flerval" :
                           question.type === "true_false" ? "Sant/Falskt" :
                           question.type === "longtextV2" ? "Essä" :
                           question.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty === "easy" ? "Lätt" :
                           question.difficulty === "medium" ? "Medel" :
                           "Svår"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: question.stimulus }}
                    />
                    {question.options && question.options.length > 0 && (
                      <div className="space-y-1">
                        {question.options.map((option) => (
                          <div
                            key={option.value}
                            className={`text-sm px-3 py-2 rounded ${
                              question.correctAnswer?.includes(option.value)
                                ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                                : "bg-muted"
                            }`}
                          >
                            <span className="font-medium mr-2">{option.label}:</span>
                            {option.value}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(question.createdAt).toLocaleDateString("sv-SE", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                      <span>
                        {question.generatedBy === "ai" ? "AI-genererad" : "Manuell"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  )
}
