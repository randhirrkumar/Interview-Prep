const security = {
  title: 'Spring Security & JWT',
  description: 'Spring Security, JWT authentication, OAuth2, and API security best practices.',
  tags: ['Spring Security', 'JWT', 'OAuth2', 'Authentication'],
  questions: [
    {
      id: 1,
      question: 'How do you implement JWT authentication in Spring Boot?',
      difficulty: 'advanced',
      asked: true,
      tags: ['JWT', 'Spring Security'],
      answer: `JWT (JSON Web Token) is a self-contained token — it carries the user identity and claims without needing a server-side session.

JWT structure: Header.Payload.Signature (3 parts, dot-separated, base64-encoded)
- Header: algorithm (HS256, RS256)
- Payload: claims (sub, exp, roles, etc.)
- Signature: HMAC(header+payload, secret) — prevents tampering

Flow:
1. Client sends credentials to /auth/login
2. Server validates, creates JWT, returns it
3. Client sends JWT in Authorization: Bearer <token> header for every request
4. Server validates JWT signature on every request (no DB lookup needed!)

The key benefit: stateless. Server doesn't store sessions. Works great for microservices.

In my MetLife project, I implemented JWT-based auth. The token contained userId and roles. Downstream services extracted user info from the token header — no DB call for every request.`,
      code: `// 1. Security Configuration
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // stateless API — no CSRF needed
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/public/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/vehicles/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

// 2. JWT Utility
@Component
public class JwtUtil {
    @Value("\${jwt.secret}")
    private String secret;

    @Value("\${jwt.expiration}")
    private long expiration;  // e.g., 86400000 (24 hours)

    public String generateToken(UserDetails user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(user.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public boolean isValid(String token, UserDetails user) {
        return extractUsername(token).equals(user.getUsername()) && !isExpired(token);
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}

// 3. JWT Filter
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(req, res);
            return;
        }

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails user = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.isValid(token, user)) {
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        chain.doFilter(req, res);
    }
}`,
      followUp: [
        { question: 'What is the difference between JWT and session-based authentication?', answer: `Session-based: server stores session data (userId, roles) in memory or Redis. Client stores only a session ID cookie. Each request: server looks up session in store. JWT-based: server stores NOTHING. Client stores the JWT. Each request: server validates the JWT signature (CPU but no DB/Redis lookup). JWT is better for microservices (no shared session store needed). Session-based is better for scenarios requiring instant revocation. Hybrid: short-lived JWT (15min) + long-lived refresh token stored server-side.` },
        { question: 'How do you invalidate a JWT token (logout)?', answer: `JWT is stateless — once issued, it's valid until expiry. True logout options: (1) Short expiry (15 minutes) + refresh tokens — users get a new access token with each refresh; on logout, invalidate the refresh token in DB. (2) Token blacklist: store invalidated token JTI (JWT ID) in Redis with TTL matching expiry. On each request, check if JTI is blacklisted. (3) Token version: store a "tokenVersion" in user DB; include version in JWT; on logout, increment version; server rejects tokens with old version. Option 1 is most common in practice.` },
        { question: 'What is RS256 vs HS256 signing?', answer: `HS256 (HMAC-SHA256): uses a SINGLE shared secret for both signing and verification. Anyone with the secret can both create and verify tokens. Simple for single-service setups, but all services need the secret — risky if a service is compromised. RS256 (RSA-SHA256): uses a PUBLIC/PRIVATE key pair. Auth server signs with the PRIVATE key. Any service verifies with the PUBLIC key. Public key can be shared openly. Best for microservices — downstream services only need the public key; only the auth server has the private key.` },
      ],
      tip: 'JWT cannot be truly invalidated (it\'s stateless). Options: short expiry + refresh tokens, or maintain a server-side blacklist (defeats the stateless benefit). Use refresh token rotation for security.',
    },
  ],
}

export default security
