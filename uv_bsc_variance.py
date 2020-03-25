# Calculate standard deviation of sensor time traces
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os
import math

# directory is the location of the the "all on" folders. Each folder should contain 3 csvs corresponding to the 3 sensors
directory = "C:\\Users\\Eshan\\Documents\\theory division\\n95\\Archive 2\\all_on"

files = os.listdir(directory)

n_positions = len(files)

# results are stored in a 3x3 array where rows and columns are spatial positions and depth is sensor number
std_array = np.zeros((3,3,3))

for pos in range(n_positions):
    
    name1 = directory + "\\" + files[pos] + "\\uv_data1.csv" 
    trace1 = pd.read_csv(name1).values
    if len(trace1) > 101:
        trace1 = trace1[100:] # some of the data was apended to baseline data at T=100
    std1 = np.std(trace1)
    
    name2 = directory + "\\" + files[pos] + "\\uv_data2.csv" 
    trace2 = pd.read_csv(name2).values
    if len(trace1)>101:
        trace2 = trace2[100:]
    std2 = np.std(trace2)
    
    name3 = directory + "\\" + files[pos] + "\\uv_data3.csv" 
    trace3 = pd.read_csv(name3).values
    if len(trace3)>101:
        trace3 = trace3[100:]
    std3 = np.std(trace3)
    
#    if math.isnan(any([std1,std2,std3])):
#        print(str(pos))
    
    col = int(np.mod(pos,3))
    row = int(np.floor(pos/3))
    
    # results are stored in a 3x3 array where rows and columns are spatial positions and depth is sensor number
    std_array[row,col,0] = std1
    std_array[row,col,1] = std2
    std_array[row,col,2] = std3
###############################################################################
pos = 0
name1 = directory + "\\" + files[pos] + "\\uv_data1.csv" 
trace1 = pd.read_csv(name1).values

name2 = directory + "\\" + files[pos] + "\\uv_data2.csv" 
trace2 = pd.read_csv(name2).values

name3 = directory + "\\" + files[pos] + "\\uv_data3.csv" 
trace3 = pd.read_csv(name3).values

fig,ax = plt.subplots(1,1,figsize=(8,5))

w = 3
CB_color_cycle = ['#377eb8', '#ff7f00', '#4daf4a',
                  '#f781bf', '#a65628', '#984ea3',
                  '#999999', '#e41a1c', '#dede00']
ax.plot(trace1,color=CB_color_cycle[0],linewidth=w,label='Top')
ax.plot(trace2,color=CB_color_cycle[1],linewidth=w,label='Middle')
ax.plot(trace3,color=CB_color_cycle[2],linewidth=w,label='Bottom')

ax.set_xlabel('Time',fontsize=15)
ax.set_ylabel('Voltage',fontsize=15)
ax.legend(fontsize=15)
ax.tick_params(labelsize = 15)