# Boilerplate

library(data.table)
library(ggplot2)
library(ggthemes)
library(patchwork)

BASE="~"
DATAREPO=file.path(BASE, "covid19_biosafety_cabinet/data")
PLOTOUT=file.path(BASE, "covid19_biosafety_cabinet/plot")
dir.create(PLOTOUT, showWarnings = FALSE, recursive = TRUE)

# Load on data
allFiles = list.files(DATAREPO, recursive = TRUE, full.names = TRUE)
lMeasures = lapply(allFiles, function(thisFile) {
  
  vThisFile = strsplit(thisFile, "/")[[1]]
  # ID hood, position and status => ASSUMPTION: Folder name carries important metadata about measurements
  splitMeta = strsplit(vThisFile[ length(vThisFile)-1 ], "_")[[1]]
  thisHood = as.numeric(gsub("[^[:digit:]]","", splitMeta[1]))
  thisPos = as.numeric(gsub("[^[:digit:]]","", splitMeta[2]))
  thisStatus = splitMeta[5]
  
  # Sanity check
  thisAltHood = as.numeric(gsub("[^[:digit:]]","", vThisFile[ grepl("hood", vThisFile) ]))
  if(thisHood != thisAltHood) { stop("Hood numbers in folder names don't match. Have directories and their names changed?") }
  
  # Load data and add obtained metadata
  thisDat = fread(thisFile)
  colnames(thisDat) = c("Measurement")
  thisDat$Hood = thisHood
  thisDat$Position = thisPos
  thisDat$Status = thisStatus
  thisDat$Time = seq(1:nrow(thisDat))
  
  return(thisDat)
  
})

# Collate data and prepare for plotting
dtMeasures = do.call(rbind, lMeasures)
dtMeasures$Hood = factor(dtMeasures$Hood)
dtMeasures$Position = factor(dtMeasures$Position)

# Obtain ranges to unify scales between on and off status
scaleRange = range(dtMeasures$Measurement)

# Figure 1: Time course of radiation measurements
p1A = ggplot(dtMeasures[ dtMeasures$Status == "on", ], aes(x = Time, y = Measurement, colour = Hood)) + 
  geom_line(alpha = 0.8) + facet_wrap(. ~ Position) + theme_minimal(base_size = 18, base_family = "") + 
  scale_y_continuous(limits = scaleRange) + theme(legend.position = "none") + ggtitle("UV-C on")

p1B = ggplot(dtMeasures[ dtMeasures$Status == "off", ], aes(x = Time, y = Measurement, colour = Hood)) + 
  geom_line(alpha = 0.8) + facet_wrap(. ~ Position) + theme_minimal(base_size = 18, base_family = "") + 
  scale_y_continuous(limits = scaleRange) + ggtitle("UV-C off") + 
  theme(axis.title.y = element_blank(), axis.text.y = element_blank())

pdf(file.path(PLOTOUT, "Figure_1_UV-C_on-off.pdf"), width = 14, height = 8)
print(p1A + p1B)
dev.off()


# Figure 2: Variance per position
### TODO: Figure 1 suggests hoods where switched on only after a while. Get only data after switching on!
### So far using hack by only looking at points after time point 100.
dtExperiment = dtMeasures[ dtMeasures$Time >= 100, ]

# ON
p2A1 = ggplot(dtExperiment[ dtExperiment$Status == "on", ], aes(x = 1, y = Measurement)) + 
  geom_jitter(alpha = 0.8, width = 0.1, height = 0) +geom_boxplot(alpha = 0.6) + 
  theme_minimal(base_size = 18, base_family = "") + scale_y_continuous(limits = scaleRange) + 
  theme(legend.position = "none", axis.text.x = element_blank(), axis.title.x = element_blank()) +
  ggtitle("UV-C on")

p2A2 = ggplot(dtExperiment[ dtExperiment$Status == "on", ], aes(x = Position, y = Measurement)) + 
  geom_jitter(alpha = 0.8, width = 0.1, height = 0) +geom_boxplot(alpha = 0.6) + 
  theme_minimal(base_size = 18, base_family = "") + 
  scale_y_continuous(limits = scaleRange) + 
  theme(legend.position = "none", axis.title.y = element_blank(), axis.text.y = element_blank())

p2A3 = ggplot(dtExperiment[ dtExperiment$Status == "on", ], aes(x = Position, y = Measurement, colour = Hood)) + 
  geom_jitter(alpha = 0.5, width = 0.1, height = 0) +geom_boxplot(alpha = 0.6) + 
  theme_minimal(base_size = 18, base_family = "") + 
  scale_y_continuous(limits = scaleRange) + 
  theme(legend.position = "none", axis.title.y = element_blank(), axis.text.y = element_blank())


# OFF
p2B1 = ggplot(dtExperiment[ dtExperiment$Status == "off", ], aes(x = 1, y = Measurement)) + 
  geom_jitter(alpha = 0.8, width = 0.1, height = 0) +geom_boxplot(alpha = 0.6) + 
  theme_minimal(base_size = 18, base_family = "") + scale_y_continuous(limits = scaleRange) + 
  theme(legend.position = "none", axis.text.x = element_blank(), axis.title.x = element_blank()) +
  ggtitle("UV-C off")

p2B2 = ggplot(dtExperiment[ dtExperiment$Status == "off", ], aes(x = Position, y = Measurement)) + 
  geom_jitter(alpha = 0.8, width = 0.1, height = 0) +geom_boxplot(alpha = 0.6) + 
  theme_minimal(base_size = 18, base_family = "") + 
  scale_y_continuous(limits = scaleRange) + 
  theme(legend.position = "none", axis.title.y = element_blank(), axis.text.y = element_blank())

p2B3 = ggplot(dtExperiment[ dtExperiment$Status == "off", ], aes(x = Position, y = Measurement, colour = Hood)) + 
  geom_jitter(alpha = 0.5, width = 0.1, height = 0) +geom_boxplot(alpha = 0.6) + 
  theme_minimal(base_size = 18, base_family = "") + 
  scale_y_continuous(limits = scaleRange) + 
  theme(legend.position = "none", axis.title.y = element_blank(), axis.text.y = element_blank())


pdf(file.path(PLOTOUT, "Figure_2_Variance_UV-C_on-off.pdf"), width = 14, height = 8)
print( ( p2A1 + p2A2 + p2A3 + plot_layout(widths = c(0.15, 0.3, 0.55)) ) /
  ( p2B1 + p2B2 + p2B3 + plot_layout(widths = c(0.15, 0.3, 0.55)) ) )
dev.off()

