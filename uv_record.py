#!/usr/bin/python3
""" Vishhvaan's Test Script """

import time
import csv
import os

import board
import busio
import adafruit_ads1x15.ads1015 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

i2c = busio.I2C(board.SCL, board.SDA)

# Create the ADC object using the I2C bus
ads = ADS.ADS1015(i2c)

pd = AnalogIn(ads, ADS.P0)
pd1 = AnalogIn(ads, ADS.P1)
pd2 = AnalogIn(ads, ADS.P2)

print("{:>5}\t{:>5}".format('raw', 'v'))

volarr = []
volarr1 = []
volarr2 = []
i = 0

hoodnus = input("Hood Number: ")
poss = input("Position: ")
hoodnu = int(hoodnus)
pos = int(poss)

os.mkdir("h{:d}_{:d}_cent_all_off".format(hoodnu,pos))
os.mkdir("h{:d}_{:d}_cent_all_on".format(hoodnu,pos))

while i<=100:
    print("PD0")
    print("{:>5}\t{:>5.3f}".format(pd.value, pd.voltage))
    volarr.append(pd.voltage)
    time.sleep(0.01)
    print("PD1")
    print("{:>5}\t{:>5.3f}".format(pd1.value, pd1.voltage))
    volarr1.append(pd1.voltage)
    time.sleep(0.01)
    print("PD2")
    print("{:>5}\t{:>5.3f}".format(pd2.value, pd2.voltage))
    volarr2.append(pd2.voltage)
    time.sleep(0.01)
    i+=1

with open("h{:d}_{:d}_cent_all_off/uv_data1.csv".format(hoodnu,pos),'w') as file:
    wr=csv.writer(file)
    wr.writerows(map(lambda x: [x], volarr))
    file.close()
with open("h{:d}_{:d}_cent_all_off/uv_data2.csv".format(hoodnu,pos),'w') as file:
    wr=csv.writer(file)
    wr.writerows(map(lambda x: [x], volarr1))
    file.close()
with open("h{:d}_{:d}_cent_all_off/uv_data3.csv".format(hoodnu,pos),'w') as file:
    wr=csv.writer(file)
    wr.writerows(map(lambda x: [x], volarr2))
    file.close()

print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
print("TURN HOOD ON!")
time.sleep(5)

i=0

while i<=100:
    print("PD0")
    print("{:>5}\t{:>5.3f}".format(pd.value, pd.voltage))
    volarr.append(pd.voltage)
    time.sleep(0.01)
    print("PD1")
    print("{:>5}\t{:>5.3f}".format(pd1.value, pd1.voltage))
    volarr1.append(pd1.voltage)
    time.sleep(0.01)
    print("PD2")
    print("{:>5}\t{:>5.3f}".format(pd2.value, pd2.voltage))
    volarr2.append(pd2.voltage)
    time.sleep(0.01)
    i+=1

with open("h{:d}_{:d}_cent_all_on/uv_data1.csv".format(hoodnu,pos),'w') as file:
    wr=csv.writer(file)
    wr.writerows(map(lambda x: [x], volarr))
    file.close()
with open("h{:d}_{:d}_cent_all_on/uv_data2.csv".format(hoodnu,pos),'w') as file:
    wr=csv.writer(file)
    wr.writerows(map(lambda x: [x], volarr1))
    file.close()
with open("h{:d}_{:d}_cent_all_on/uv_data3.csv".format(hoodnu,pos),'w') as file:
    wr=csv.writer(file)
    wr.writerows(map(lambda x: [x], volarr2))
    file.close()


