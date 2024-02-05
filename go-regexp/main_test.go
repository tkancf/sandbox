
package main

import (
	"regexp"
	"testing"
)

// TestExtractMatchingStrings は ExtractMatchingStrings 関数のテストを行います。
func TestExtractMatchingStrings(t *testing.T) {
	pattern := regexp.MustCompile(`\[([A-Z][^\]]*)\]`)
	tests := []struct {
		input    string
		expected string
	}{
		{"[EXAMPLE] some text", "EXAMPLE"},
		{"no match here", ""},
		{"[ANOTHER-EXAMPLE] more text", "ANOTHER-EXAMPLE"},
	}

	for _, test := range tests {
		result := ExtractMatchingStrings(test.input, pattern)
		if result != test.expected {
			t.Errorf("ExtractMatchingStrings(%q) = %q, want %q", test.input, result, test.expected)
		}
	}
}
