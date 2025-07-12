-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "phase" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalComponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "EnvironmentalComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Impact" (
    "id" TEXT NOT NULL,
    "magnitude" INTEGER NOT NULL,
    "importance" INTEGER NOT NULL,
    "description" TEXT,
    "mitigationMeasures" TEXT,
    "aiAnalysis" TEXT,
    "projectId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "environmentalComponentId" TEXT NOT NULL,

    CONSTRAINT "Impact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalComponent" ADD CONSTRAINT "EnvironmentalComponent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impact" ADD CONSTRAINT "Impact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impact" ADD CONSTRAINT "Impact_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impact" ADD CONSTRAINT "Impact_environmentalComponentId_fkey" FOREIGN KEY ("environmentalComponentId") REFERENCES "EnvironmentalComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
