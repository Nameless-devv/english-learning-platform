-- CreateIndex
CREATE INDEX "user_progress_userId_nextReviewDate_idx" ON "user_progress"("userId", "nextReviewDate");

-- CreateIndex
CREATE INDEX "user_progress_nextReviewDate_idx" ON "user_progress"("nextReviewDate");
