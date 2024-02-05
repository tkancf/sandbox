package main

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
)

const pattern_regex = `\[([A-Z][^\]]*)\]`

func ExtractMatchingStrings(line string, pattern *regexp.Regexp) string {
	matches := pattern.FindStringSubmatch(line)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

// ProcessLines は、標準入力から読み取った各行に対して ExtractMatchingStrings を呼び出し、結果を出力します。
func ProcessLines(scanner *bufio.Scanner, pattern *regexp.Regexp) {
	for scanner.Scan() {
		line := scanner.Text()
		match := ExtractMatchingStrings(line, pattern)
		if match != "" {
			fmt.Println(match)
		}
	}
	if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "読み込みエラー:", err)
	}
}

func main() {
	pattern := regexp.MustCompile(pattern_regex)
	scanner := bufio.NewScanner(os.Stdin)
	ProcessLines(scanner, pattern)
}
