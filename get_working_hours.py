#!/bin/env python3

# pour travail de nuit:
# fin 23:59
# recommence à 00:00

# objectif: obtenir les dates individuelles par jour

from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timedelta
import json
import pandas as pd
import re
import sys

Filename = 'sample_data.csv'


def main():
    df = pd.read_csv(Filename)
    keycols = ["Department", "Name", "No.", "ID Number"]

    output = []

    for emp in df.groupby(keycols):
        key, date_times = parse_row(emp)

        work_times: defaultdict[date, timedelta] = defaultdict(lambda: timedelta(0))
        working = False
        last_clock_in = None
        for dt, in date_times:
            dt = datetime.strptime(dt, '%d/%m/%Y %H:%M:%S')

            if not working:
                last_clock_in = dt
            else:
                assert last_clock_in is not None

                date_diff = dt.date() - last_clock_in.date()
                if date_diff > timedelta(0):
                    # make previous work until 23:59
                    work_times[last_clock_in.date()] += date_with_time(last_clock_in, 23, 59, 59) - last_clock_in

                    # account for full days of work without sleep (scary)
                    while date_diff > timedelta(1):
                        last_clock_in += timedelta(1)
                        work_times[last_clock_in.date()] += timedelta(1)
                        date_diff = last_clock_in.date() - dt.date()
                    # make next work since midnight
                    last_clock_in = date_with_time(dt, 0, 0, 0)
                    working = True

                work_times[dt.date()] += dt - last_clock_in
            working ^= True

        output.append({'key': vars(key), 'work_times': {str(work_date): str(round_down(
            add_benefits(work_time, key.id_number_c))) for work_date, work_time in work_times.items()}})

    #json.dump(output, sys.stdout)

    for o in output:
        print(tuple(o['key'].values()))
        for k, v in o['work_times'].items():
            print(k, '', v)
    


def date_with_time(d: date | datetime, h: int, m: int, s: int):
    return datetime(d.year, d.month, d.day, h, m, s)


@dataclass(frozen=True)
class Key:
    department: str
    name: str
    no: int
    id_number_c: str
    id_number_n: str


def parse_row(emp):
    key, a = emp
    date_times = a[['Date/Time']].to_numpy()
    return Key(key[0], key[1], int(key[2]), *parse_id_number(key[3])), date_times


def parse_id_number(id_number: str):
    m = re.match(r'^([A-Z]+)(\d*)$', id_number)
    if m is None:
        raise ValueError(f"ID number '{id_number}' match failed")
    return m.group(1), m.group(2)


def add_benefits(work_time: timedelta, id_c: str):
    match id_c:
        #case 'A' | 'B' | 'C':
        #    return work_time + timedelta(minutes=30)
        case _:
            return work_time


def round_down(work_time: timedelta):
    return work_time #- work_time % timedelta(minutes=30)


if __name__ == '__main__':
    main()
