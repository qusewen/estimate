"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Calculator } from "lucide-react"

export default function TaskEstimator() {
  const [days, setDays] = useState("")
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  
  const [reviewDays, setReviewDays] = useState("")
  const [reviewHours, setReviewHours] = useState("")
  const [reviewMinutes, setReviewMinutes] = useState("")
  
  const [bufferDays, setBufferDays] = useState("")
  const [bufferHours, setBufferHours] = useState("")
  const [bufferMinutes, setBufferMinutes] = useState("")
  
  const [testDays, setTestDays] = useState("")
  const [testHours, setTestHours] = useState("")
  const [testMinutes, setTestMinutes] = useState("")
  const [testPercent, setTestPercent] = useState("")
  
  const [assumptions, setAssumptions] = useState("")
  const [dependencies, setDependencies] = useState("")
  const [performerLevel, setPerformerLevel] = useState("")
  const [estimatedBy, setEstimatedBy] = useState("")
  const [result, setResult] = useState("")
  const [copied, setCopied] = useState(false)

  const calcTotalHours = (d: string, h: string, m: string) => {
    const dNum = parseInt(d) || 0
    const hNum = parseInt(h) || 0
    const mNum = parseInt(m) || 0
    const totalMinutes = dNum * 8 * 60 + hNum * 60 + mNum
    return Math.round(totalMinutes / 60 * 10) / 10
  }

  const formatEffort = (d: string, h: string, m: string) => {
    const dNum = parseInt(d) || 0
    const hNum = parseInt(h) || 0
    const mNum = parseInt(m) || 0


    const parts: string[] = []
    if (dNum > 0) parts.push(`${dNum}d`)
    if (hNum > 0) parts.push(`${hNum}h`)
    if (mNum > 0) parts.push(`${mNum}m`)

    if (parts.length === 0) return null
    
    return `${parts.join(" ")}`
  }

  const calcTestHours = () => {
    const percent = parseInt(testPercent) || 0
    if (percent > 0) {
      const mainHours = calcTotalHours(days, hours, minutes)
      return Math.ceil(mainHours * percent / 100)
    }
    return calcTotalHours(testDays, testHours, testMinutes)
  }

  const formatTestEffort = () => {
    const percent = parseInt(testPercent) || 0
    if (percent > 0) {
      const testHoursCalc = calcTestHours()
      const testDaysCalc = Math.floor(testHoursCalc / 8)
      const remainingHours = testHoursCalc % 8
      
      const parts: string[] = []
      if (testDaysCalc > 0) parts.push(`${testDaysCalc}d`)
      if (remainingHours > 0) parts.push(`${remainingHours}h`)
      
      if (parts.length === 0) return null
      return `${parts.join(" ")} (${testHoursCalc}h)`
    }
    return formatEffort(testDays, testHours, testMinutes)
  }

  const formatTotalSum = () => {
    const mainHours = calcTotalHours(days, hours, minutes)
    const reviewHoursTotal = calcTotalHours(reviewDays, reviewHours, reviewMinutes)
    const bufferHoursTotal = calcTotalHours(bufferDays, bufferHours, bufferMinutes)
    const testHoursTotal = calcTestHours()
    
    const totalHours = mainHours + reviewHoursTotal + bufferHoursTotal + testHoursTotal
    
    const totalDays = Math.floor(totalHours / 8)
    const remainingHours = Math.round((totalHours % 8) * 10) / 10
    
    const parts: string[] = []
    if (totalDays > 0) parts.push(`${totalDays}d`)
    if (remainingHours > 0) parts.push(`${remainingHours}h`)
    
    if (parts.length === 0) return "0h"
    
    return `${parts.join(" ")}`
  }

  const formatPerformerLevel = () => {
    switch (performerLevel) {
      case "junior": return "junior"
      case "middle": return "middle"
      case "senior": return "senior"
      case "middle-senior": return "middle/senior"
      default: return ""
    }
  }

  const formatEstimatedBy = () => {
    switch (estimatedBy) {
      case "tl": return "TL"
      case "tl-fe": return "TL + FE"
      default: return ""
    }
  }

  const handleEstimate = () => {
    const mainEffort = formatEffort(days, hours, minutes)
    const reviewEffort = formatEffort(reviewDays, reviewHours, reviewMinutes)
    const bufferEffort = formatEffort(bufferDays, bufferHours, bufferMinutes)
    const testEffort = formatTestEffort()
    
    const breakdownParts: string[] = []
    if (mainEffort) breakdownParts.push(`development: ${mainEffort}`)
    if (reviewEffort) breakdownParts.push(`review: ${reviewEffort}`)
    if (testEffort) breakdownParts.push(`testing: ${testEffort}`)
    if (bufferEffort) breakdownParts.push(`buffer: ${bufferEffort}`)
    
    const breakdown = breakdownParts.length > 0 
      ? breakdownParts.join(" + ") 
      : "not specified"

    const lines = [
      `estimated effort: ${formatTotalSum()} ${breakdown}`,
      `assumptions: ${assumptions || "—"}`,
      `dependencies: ${dependencies || "—"}`,
      `expected performer level: ${formatPerformerLevel() || "—"}`,
      `estimated by: ${formatEstimatedBy() || "—"}`,
    ]
    setResult(lines.join("\n"))
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = result
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const TimeInputGroup = ({ 
    d, h, m, 
    setD, setH, setM 
  }: { 
    d: string; h: string; m: string;
    setD: (v: string) => void; setH: (v: string) => void; setM: (v: string) => void;
  }) => (
    <div className="flex gap-3">
      <div className="flex-1">
        <div className="relative">
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={d}
            onChange={(e) => setD(e.target.value)}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            д
          </span>
        </div>
      </div>
      <div className="flex-1">
        <div className="relative">
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={h}
            onChange={(e) => setH(e.target.value)}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ч
          </span>
        </div>
      </div>
      <div className="flex-1">
        <div className="relative">
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={m}
            onChange={(e) => setM(e.target.value)}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            м
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="h-6 w-6" />
              Оценка задачи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <Label className="text-base font-medium">Время на разработку</Label>
              <TimeInputGroup 
                d={days} h={hours} m={minutes}
                setD={setDays} setH={setHours} setM={setMinutes}
              />
              <p className="text-sm text-muted-foreground">
                Чистое время на написание кода и реализацию функционала. 1 день = 8 рабочих часов.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Время на ревью</Label>
              <TimeInputGroup 
                d={reviewDays} h={reviewHours} m={reviewMinutes}
                setD={setReviewDays} setH={setReviewHours} setM={setReviewMinutes}
              />
              <p className="text-sm text-muted-foreground">
                Время на код-ревью, правки по замечаниям и повторные проверки.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Буфер на непредвиденное</Label>
              <TimeInputGroup 
                d={bufferDays} h={bufferHours} m={bufferMinutes}
                setD={setBufferDays} setH={setBufferHours} setM={setBufferMinutes}
              />
              <p className="text-sm text-muted-foreground">
                Запас времени на неожиданные проблемы, баги, уточнения требований и прочие риски.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Время на тестирование</Label>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <TimeInputGroup 
                    d={testDays} h={testHours} m={testMinutes}
                    setD={setTestDays} setH={setTestHours} setM={setTestMinutes}
                  />
                </div>
                <div className="text-sm text-muted-foreground pb-2">или</div>
                <div className="w-24">
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={testPercent}
                      onChange={(e) => setTestPercent(e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Время на тесты. Можно указать вручную или ввести процент от времени разработки — он будет округлён вверх.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Допущения (Assumptions)</Label>
              <Textarea
                placeholder="Например: требования в задаче не меняются в процессе разработки"
                value={assumptions}
                onChange={(e) => setAssumptions(e.target.value)}
                rows={2}
              />
              <p className="text-sm text-muted-foreground">
                Условия и предположения, при которых оценка актуальна. Что должно быть истинным, чтобы оценка сработала.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Зависимости (Dependencies)</Label>
              <Textarea
                placeholder="Например: ODD-1 - могут блокировать выполнение"
                value={dependencies}
                onChange={(e) => setDependencies(e.target.value)}
                rows={2}
              />
              <p className="text-sm text-muted-foreground">
                Задачи или внешние факторы, которые могут заблокировать или повлиять на выполнение. Укажите номера тикетов.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Уровень исполнителя (Expected Performer Level)</Label>
              <Select value={performerLevel} onValueChange={setPerformerLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="middle-senior">Middle / Senior</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Минимальный уровень разработчика, который сможет выполнить задачу за указанное время.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Кто оценил (Estimated By)</Label>
              <Select value={estimatedBy} onValueChange={setEstimatedBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите оценщика" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tl">Team Lead</SelectItem>
                  <SelectItem value="tl-fe">Team Lead + FE</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Кто проводил оценку задачи.
              </p>
            </div>

            <Button onClick={handleEstimate} className="w-full" size="lg">
              <Calculator className="mr-2 h-4 w-4" />
              Оценить задачу
            </Button>

            {result && (
              <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                <Label className="text-base font-medium">Результат</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    rows={6}
                    className="font-mono text-sm bg-background"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Можете отредактировать текст перед копированием.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
