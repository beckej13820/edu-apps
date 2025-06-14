# Embedding Guidelines for Edu Apps

This document outlines the rules and best practices for creating embeddable educational applications that can be used across different platforms, including GitHub Pages, D2L Brightspace, and WordPress.

## Core Principles

1. **Responsive Design**
   - Use relative units (%, em, rem) instead of fixed pixels
   - Implement fluid layouts that adapt to container size
   - Test at various viewport sizes

2. **Security**
   - Use HTTPS for all resources
   - Implement appropriate Content Security Policy headers
   - Allow embedding via X-Frame-Options headers

3. **Cross-Platform Compatibility**
   - Support iframe embedding
   - Implement postMessage for cross-frame communication
   - Avoid platform-specific features

## Platform-Specific Considerations

### D2L Brightspace
- Use `sandbox="allow-scripts allow-same-origin"` for iframes
- Avoid popups and new window navigation
- Keep file sizes small for better performance
- Test in the D2L content editor

### WordPress
- Support shortcode embedding
- Use `frameborder="0"` for iframes
- Implement responsive design for various themes
- Test in the WordPress block editor

### GitHub Pages
- Ensure all paths are relative
- Use HTTPS for all resources
- Implement proper caching headers
- Test in different browsers

## Implementation Guidelines

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Use HTTPS for all resources -->
    <link rel="stylesheet" href="https://cdn.example.com/styles.css">
</head>
<body>
    <div class="container">
        <!-- Your app content -->
    </div>
</body>
</html>
```

### CSS Best Practices
```css
/* Use relative units */
.container {
    width: 100%;
    max-width: 100%;
    padding: 1rem;
}

/* Avoid fixed dimensions */
.element {
    width: 100%;
    height: auto;
}

/* Use media queries for responsiveness */
@media (max-width: 768px) {
    .container {
        padding: 0.5rem;
    }
}
```

### JavaScript Best Practices
```javascript
// Implement postMessage support
window.addEventListener('message', function(event) {
    // Verify origin
    if (event.origin !== window.location.origin) return;
    
    // Handle messages
    if (event.data.type === 'getData') {
        // Send data back to parent
        event.source.postMessage({
            type: 'data',
            content: yourData
        }, event.origin);
    }
});

// Avoid direct navigation
// Instead of:
// window.location = 'new-page.html';
// Use:
// window.parent.postMessage({ type: 'navigate', url: 'new-page.html' }, '*');
```

## Testing Checklist

1. **Responsive Design**
   - [ ] Test at various viewport sizes
   - [ ] Verify fluid layouts
   - [ ] Check mobile responsiveness

2. **Cross-Platform**
   - [ ] Test in D2L Brightspace
   - [ ] Test in WordPress
   - [ ] Test in GitHub Pages
   - [ ] Verify iframe embedding

3. **Security**
   - [ ] Verify HTTPS usage
   - [ ] Check Content Security Policy
   - [ ] Test X-Frame-Options
   - [ ] Validate input/output

4. **Performance**
   - [ ] Optimize file sizes
   - [ ] Minimize HTTP requests
   - [ ] Implement caching
   - [ ] Test load times

## Common Issues and Solutions

1. **Iframe Sizing**
   - Problem: Content doesn't fit iframe
   - Solution: Use responsive units and dynamic height adjustment

2. **Cross-Origin Communication**
   - Problem: Can't communicate between frames
   - Solution: Implement postMessage with origin verification

3. **Resource Loading**
   - Problem: Resources blocked in iframe
   - Solution: Use HTTPS and proper CSP headers

4. **Mobile Responsiveness**
   - Problem: Layout breaks on mobile
   - Solution: Use responsive design and test on various devices

## Additional Resources

- [MDN Web Docs: iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
- [MDN Web Docs: postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [D2L Brightspace Documentation](https://documentation.brightspace.com/)
- [WordPress Developer Documentation](https://developer.wordpress.org/) 