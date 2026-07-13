import React from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import PlainText from "../../src/components/PlainText";
import {
  CardSurface,
  LoadingSpinner,
  LogoTitleRow,
  PillButton,
} from "../../src/components/ui";
import {
  GAME_DIFFICULTIES,
  MAX_GUESSES,
  challengeFor,
  dailyPuzzle,
  isCorrectGuess,
  normalizeIntegerGuess,
  shareText,
  statsFor,
  type DailyPlay,
  type GameDifficulty,
} from "../../src/game/daily";
import {
  gameProgress,
  gameProgressVersion,
  isGameProgressLoaded,
  loadGameProgress,
  recordDailyPlay,
  subscribeGameProgress,
} from "../../src/game/progressStore";
import { isoDate } from "../../src/oeis/dayPick";
import { blurbFor } from "../../src/sequences/metadata";
import { useThemeColors } from "../../src/theme";
import {
  MAX_INFO_WIDTH,
  PAGE_PADDING,
  safeAreaTop,
  tabBarScrollPadding,
  webContentColumn,
} from "../../src/theme/layout";
import { radii, spacing, touch } from "../../src/theme/tokens";

const DIFFICULTIES = Object.keys(GAME_DIFFICULTIES) as GameDifficulty[];

function displayDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function DailyGameScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const [today, setToday] = React.useState(isoDate());
  const [difficulty, setDifficulty] = React.useState<GameDifficulty>("easy");
  const [input, setInput] = React.useState("");
  const [feedback, setFeedback] = React.useState("");

  React.useSyncExternalStore(
    subscribeGameProgress,
    gameProgressVersion,
    gameProgressVersion
  );

  React.useEffect(() => {
    void loadGameProgress();
    const timer = setInterval(() => setToday(isoDate()), 60_000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    setInput("");
    setFeedback("");
  }, [today]);

  const puzzle = React.useMemo(() => dailyPuzzle(today), [today]);
  const saved = gameProgress().plays[today];
  const play = saved?.anum === puzzle.anum ? saved : undefined;
  const activeDifficulty = play?.difficulty ?? difficulty;
  const challenge = React.useMemo(
    () => challengeFor(puzzle, activeDifficulty, today),
    [activeDifficulty, puzzle, today]
  );
  const guesses = play?.guesses ?? [];
  const config = GAME_DIFFICULTIES[activeDifficulty];
  const hint = blurbFor(puzzle.anum) ?? "Look at how each term changes.";
  const showHint = play?.completed || guesses.length >= config.hintAfter;
  const stats = statsFor(gameProgress().plays, today);

  const submitGuess = React.useCallback(
    (raw: string) => {
      if (play?.completed) return;
      const guess = normalizeIntegerGuess(raw);
      if (guess === null) {
        setFeedback("Enter one whole number.");
        return;
      }
      if (guesses.includes(guess)) {
        setFeedback("You already tried that number.");
        return;
      }

      const nextGuesses = [...guesses, guess];
      const won = isCorrectGuess(guess, challenge.answer);
      const completed = won || nextGuesses.length >= MAX_GUESSES;
      const nextPlay: DailyPlay = {
        date: today,
        anum: puzzle.anum,
        difficulty: activeDifficulty,
        guesses: nextGuesses,
        completed,
        won,
      };
      recordDailyPlay(nextPlay);
      setInput("");
      setFeedback(
        won
          ? `Solved in ${nextGuesses.length} ${nextGuesses.length === 1 ? "guess" : "guesses"}.`
          : completed
            ? "Out of guesses. The answer is revealed below."
            : `${MAX_GUESSES - nextGuesses.length} guesses left.`
      );

      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(
          won
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Error
        );
      }
    },
    [activeDifficulty, challenge.answer, guesses, play?.completed, puzzle.anum, today]
  );

  const shareResult = React.useCallback(async () => {
    if (!play?.completed) return;
    const message = shareText(play);
    try {
      if (Platform.OS === "web") {
        const nav = globalThis.navigator as Navigator & {
          share?: (data: ShareData) => Promise<void>;
        };
        if (nav.share) {
          await nav.share({ text: message, url: globalThis.location?.href });
        } else {
          await nav.clipboard.writeText(message);
          setFeedback("Result copied.");
        }
      } else {
        await Share.share({ message });
      }
    } catch {
      // Cancelling a share sheet is not an error the player needs to see.
    }
  }, [play]);

  return (
    <View style={styles.container} testID="daily-game-screen" nativeID="main">
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.hero}>
          <LogoTitleRow
            title="OEISdle"
            subtitle="One sequence. One puzzle. Every day."
            size="page"
            titleTestID="daily-game-title"
          />
        </View>

        <View style={styles.statsRow}>
          <CardSurface variant="chip" style={styles.statChip}>
            <PlainText style={styles.statLabel}>Today</PlainText>
            <PlainText style={styles.statValue}>{displayDate(today)}</PlainText>
          </CardSurface>
          <CardSurface variant="chip" style={styles.statChip}>
            <PlainText style={styles.statLabel}>Streak</PlainText>
            <PlainText style={styles.statValue}>{String(stats.streak)}</PlainText>
          </CardSurface>
          <CardSurface variant="chip" style={styles.statChip}>
            <PlainText style={styles.statLabel}>Wins</PlainText>
            <PlainText style={styles.statValue}>{`${stats.wins}/${stats.played}`}</PlainText>
          </CardSurface>
        </View>

        {!isGameProgressLoaded() ? (
          <View style={styles.loading}>
            <LoadingSpinner />
          </View>
        ) : (
          <>
            <PlainText style={styles.sectionLabel}>Difficulty</PlainText>
            <View style={styles.difficultyRow} testID="daily-difficulty">
              {DIFFICULTIES.map((id) => {
                const selected = activeDifficulty === id;
                const locked = guesses.length > 0;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setDifficulty(id)}
                    disabled={locked}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, disabled: locked }}
                    testID={`daily-difficulty-${id}`}
                    style={({ pressed }) => [
                      styles.difficulty,
                      selected && styles.difficultySelected,
                      locked && !selected && styles.disabled,
                      pressed && !locked && styles.pressed,
                    ]}
                  >
                    <PlainText style={selected ? styles.difficultyTitleOn : styles.difficultyTitle}>
                      {GAME_DIFFICULTIES[id].label}
                    </PlainText>
                    <PlainText style={styles.difficultyDescription}>
                      {GAME_DIFFICULTIES[id].description}
                    </PlainText>
                  </Pressable>
                );
              })}
            </View>

            <CardSurface style={styles.gameCard}>
              <View style={styles.promptRow}>
                <View>
                  <PlainText style={styles.eyebrow}>{`${GAME_DIFFICULTIES[activeDifficulty].label} puzzle`}</PlainText>
                  <PlainText style={styles.prompt}>What comes next?</PlainText>
                </View>
                <PlainText style={styles.guessCount}>{`${guesses.length}/${MAX_GUESSES} guesses`}</PlainText>
              </View>

              <View style={styles.terms} testID="daily-terms">
                {challenge.clues.map((term, index) => (
                  <View key={`${term}-${index}`} style={styles.term}>
                    <PlainText style={styles.termText}>{term}</PlainText>
                  </View>
                ))}
                <View style={[styles.term, styles.questionTerm]}>
                  <PlainText style={styles.questionText}>?</PlainText>
                </View>
              </View>

              {showHint ? (
                <View style={styles.hint} testID="daily-hint">
                  <PlainText style={styles.hintLabel}>Hint</PlainText>
                  <PlainText style={styles.hintText}>{hint}</PlainText>
                </View>
              ) : null}

              {!play?.completed && config.choiceCount > 0 ? (
                <View style={styles.choices} testID="daily-choices">
                  {challenge.choices.map((choice, index) => {
                    const tried = guesses.includes(choice);
                    return (
                      <Pressable
                        key={choice}
                        onPress={() => submitGuess(choice)}
                        disabled={tried}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: tried }}
                        testID={`daily-choice-${index}`}
                        style={({ pressed }) => [
                          styles.choice,
                          tried && styles.choiceTried,
                          pressed && !tried && styles.pressed,
                        ]}
                      >
                        <PlainText style={tried ? styles.choiceTextTried : styles.choiceText}>
                          {choice}
                        </PlainText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {!play?.completed && config.choiceCount === 0 ? (
                <View style={styles.inputRow}>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={() => submitGuess(input)}
                    placeholder="Next term"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    accessibilityLabel="Next term"
                    testID="daily-answer-input"
                    style={styles.input}
                  />
                  <PillButton
                    variant="primary"
                    onPress={() => submitGuess(input)}
                    disabled={!input.trim()}
                    testID="daily-submit"
                  >
                    Guess
                  </PillButton>
                </View>
              ) : null}

              {feedback ? (
                <PlainText style={styles.feedback} testID="daily-feedback">
                  {feedback}
                </PlainText>
              ) : null}
            </CardSurface>

            {play?.completed ? (
              <View testID="daily-result">
                <CardSurface style={styles.resultCard}>
                  <PlainText style={styles.resultTitle}>
                    {play.won ? "You found it" : "Today's sequence"}
                  </PlainText>
                  <PlainText style={styles.answer}>{challenge.answer}</PlainText>
                  <PlainText style={styles.sequenceName}>{puzzle.name}</PlainText>
                  <PlainText style={styles.anum}>{puzzle.anum}</PlainText>
                  <PlainText style={styles.resultHint}>{hint}</PlainText>
                  <View style={styles.resultActions}>
                    <PillButton
                      variant="action"
                      icon="share-outline"
                      onPress={shareResult}
                      testID="daily-share"
                    >
                      Share
                    </PillButton>
                    <PillButton
                      variant="primary"
                      icon="play-outline"
                      onPress={() => router.push(`/visualize/${puzzle.anum}`)}
                      testID="daily-visualize"
                      flex
                    >
                      See visualization
                    </PillButton>
                  </View>
                  <PlainText style={styles.tomorrow}>New puzzle tomorrow.</PlainText>
                </CardSurface>
              </View>
            ) : null}
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardAvoider: {
    flex: 1,
  },
  content: {
    paddingTop: safeAreaTop("home"),
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: tabBarScrollPadding(),
    ...webContentColumn(MAX_INFO_WIDTH),
  },
  hero: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statChip: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  loading: {
    paddingVertical: 80,
    alignItems: "center",
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  difficultyRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  difficulty: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bgCard,
    padding: spacing.sm,
    justifyContent: "center",
  },
  difficultySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  difficultyTitle: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: "700",
  },
  difficultyTitleOn: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  difficultyDescription: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.78,
  },
  gameCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  prompt: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  guessCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  terms: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  term: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  termText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  questionTerm: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  questionText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  hint: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    backgroundColor: colors.primaryDim,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  hintLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  hintText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  choice: {
    flexGrow: 1,
    minWidth: "46%",
    minHeight: touch.minHeight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  choiceTried: {
    borderColor: colors.accentAlt,
    opacity: 0.45,
  },
  choiceText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  choiceTextTried: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: "700",
    textDecorationLine: "line-through",
    fontVariant: ["tabular-nums"],
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: touch.minHeight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 17,
    paddingHorizontal: spacing.md,
    fontVariant: ["tabular-nums"],
  },
  feedback: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  resultCard: {
    padding: spacing.lg,
    alignItems: "center",
  },
  resultTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  answer: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "900",
    marginTop: spacing.sm,
    fontVariant: ["tabular-nums"],
  },
  sequenceName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  anum: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  resultHint: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: spacing.md,
  },
  resultActions: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  tomorrow: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.md,
  },
});
