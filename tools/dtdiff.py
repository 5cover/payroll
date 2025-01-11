#!/usr/bin/env python3

from datetime import datetime, timedelta
import argparse as ap

parser = ap.ArgumentParser('dtdiff')

def dt(x: str):
    return datetime.strptime(x, '%d/%m/%Y %H:%M:%S')

parser.add_argument('date1', type=dt)
parser.add_argument('date2', type=dt)
args = parser.parse_args()

print(args.date1 - args.date2, end='|work')