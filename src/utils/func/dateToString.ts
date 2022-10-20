//In case if the way of date display change
//Yes displaying the gmt time is not best option but it is better in case the user is in +12 or -11 timezone
export default function DateToString(date: Date): string {
  const locale = [...date.toUTCString().split("")]
    .filter((_, ind) => ind < 11 || ind > 16)
    .join("");

  return locale;
}
