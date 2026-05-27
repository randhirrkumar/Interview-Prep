const sso = {
  title: 'SSO / SAML / OAuth2',
  description: 'Single Sign-On, SAML 2.0 protocol, OAuth2, OpenID Connect, and Spring Security integration.',
  tags: ['SSO', 'SAML', 'OAuth2', 'Spring Security', 'Security'],
  questions: [
    {
      id: 1,
      question: 'What is Single Sign-On (SSO)? How does it work?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['SSO', 'Authentication'],
      answer: `SSO allows a user to log in once and access multiple applications without logging in again for each one.

Think of it like this: once you log into your corporate network, you can access Gmail, Salesforce, GitHub — all without re-entering your password. That's SSO in action.

How it works at a high level:
1. User tries to access Application A
2. Application A sees the user is not authenticated
3. Application A redirects to the Identity Provider (IdP) — e.g., Azure AD, Okta, Ping Identity
4. User authenticates with the IdP (enters credentials once)
5. IdP generates a token/assertion and redirects back to Application A
6. Application A validates the token and grants access

The key players:
- Service Provider (SP): Your application that wants to authenticate the user
- Identity Provider (IdP): Centralized authentication server (Azure AD, Okta, AD FS)
- Protocol: SAML 2.0 or OAuth2/OIDC

I implemented SAML-based SSO in my MetLife project — their enterprise users authenticated through their corporate Active Directory via SAML, not through username/password in our database.`,
      code: `// SSO Flow Diagram:
/*
  User → App (SP)                   IdP (Azure AD / Okta)
    1. Access /dashboard
    2. Not authenticated → redirect to IdP with SAMLRequest
    3.                     ← IdP login page
    4. Enter credentials (once)
    5.                     → IdP validates
    6.                     → Redirect to SP with SAMLResponse (assertion)
    7. SP validates assertion → creates session
    8. User gets access ✓

  Next time user accesses another app:
    1. Access App B
    2. Not authenticated → redirect to IdP
    3. IdP sees user already has session → skips login
    4. Sends assertion directly → User gets access without re-entering credentials
*/

// Benefits of SSO:
// 1. Better UX — one login for all apps
// 2. Better security — centralized auth, easier to enforce MFA
// 3. Easier offboarding — disable in IdP, access revoked everywhere
// 4. Reduced password fatigue — fewer passwords to remember/forget`,
      followUp: [
        'What is the difference between SSO and OAuth2?',
        'What is the difference between authentication and authorization?',
        'What are the risks of SSO? (single point of failure)',
      ],
      tip: 'SSO is about Authentication (who are you). OAuth2 is about Authorization (what can you do). They are different but often used together. OIDC = OAuth2 + identity layer.',
    },
    {
      id: 2,
      question: 'Explain the SAML 2.0 protocol. What is an assertion? What is SP-initiated vs IdP-initiated flow?',
      difficulty: 'advanced',
      asked: true,
      tags: ['SAML', 'SSO', 'Protocol'],
      answer: `SAML (Security Assertion Markup Language) is an XML-based protocol for exchanging authentication and authorization data between an IdP and SP.

A SAML Assertion is an XML document that the IdP sends to the SP after successful authentication. It contains:
- Who the user is (NameID — could be email or username)
- When they authenticated
- Attributes (roles, department, email)
- Validity period (NotBefore, NotOnOrAfter)
- Digital signature (to prevent tampering)

SP-initiated flow (most common):
User accesses SP → SP redirects to IdP with SAMLRequest → User authenticates → IdP sends SAMLResponse to SP's Assertion Consumer Service (ACS) URL

IdP-initiated flow:
User goes directly to IdP → Authenticates → IdP sends SAMLResponse to SP. No SAMLRequest — the SP must accept assertions without a prior request. Slightly less secure.

In my MetLife project, we had SP-initiated flow where users started from the MetLife portal and got redirected to the corporate IdP (Azure AD).`,
      code: `<!-- SAMLRequest (encoded) sent from SP to IdP -->
<samlp:AuthnRequest
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  ID="_abc123"
  Version="2.0"
  IssueInstant="2024-01-15T10:00:00Z"
  Destination="https://idp.company.com/sso/saml"
  AssertionConsumerServiceURL="https://myapp.com/saml/callback">
  <saml:Issuer>https://myapp.com/saml/metadata</saml:Issuer>
</samlp:AuthnRequest>

<!-- SAMLResponse (simplified) from IdP to SP -->
<samlp:Response ...>
  <saml:Assertion>
    <saml:Issuer>https://idp.company.com</saml:Issuer>
    <saml:Subject>
      <saml:NameID Format="...emailAddress">
        randhir@company.com           <!-- who the user is -->
      </saml:NameID>
    </saml:Subject>
    <saml:Conditions
      NotBefore="2024-01-15T10:00:00Z"
      NotOnOrAfter="2024-01-15T10:05:00Z">  <!-- validity window -->
    </saml:Conditions>
    <saml:AttributeStatement>
      <saml:Attribute Name="Role">
        <saml:AttributeValue>ADMIN</saml:AttributeValue>
      </saml:Attribute>
      <saml:Attribute Name="Email">
        <saml:AttributeValue>randhir@company.com</saml:AttributeValue>
      </saml:Attribute>
    </saml:AttributeStatement>
    <ds:Signature>  <!-- digital signature to verify IdP -->
      ...
    </ds:Signature>
  </saml:Assertion>
</samlp:Response>`,
      followUp: [
        'How does SAML prevent replay attacks?',
        'What is the Assertion Consumer Service (ACS) URL?',
        'What is SAML metadata? What does it contain?',
      ],
      tip: 'SAML prevents replay attacks using the InResponseTo attribute (ties response to a specific request) and short validity windows (NotBefore/NotOnOrAfter). Mention both.',
    },
    {
      id: 3,
      question: 'How do you implement SAML SSO in a Spring Boot application?',
      difficulty: 'advanced',
      asked: true,
      tags: ['SAML', 'Spring Security', 'Spring Boot', 'Implementation'],
      answer: `I implemented SAML SSO in Spring Boot using Spring Security's SAML 2.0 support (available since Spring Security 5.2). The modern way uses spring-security-saml2-service-provider.

The implementation steps:
1. Add dependency (spring-security-saml2-service-provider)
2. Configure the IdP metadata (either URL or XML file)
3. Register the SP (our app) credentials — our signing key and certificate
4. Configure Security filter chain
5. Map SAML attributes to Spring Security authorities

Key configuration: RelyingPartyRegistration defines the relationship between SP and IdP. You need the IdP metadata (usually downloaded from Azure AD or Okta portal).

In MetLife, the IdP was Azure AD. I registered our application in Azure AD, downloaded the Federation Metadata XML, and configured it in our Spring Boot app. Users could then log in with their corporate Microsoft account.`,
      code: `<!-- pom.xml dependency -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-saml2-service-provider</artifactId>
</dependency>
<dependency>
    <groupId>org.opensaml</groupId>
    <artifactId>opensaml-core</artifactId>
    <version>4.3.0</version>
</dependency>

// Security Configuration
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**", "/saml/**").permitAll()
                .anyRequest().authenticated()
            )
            .saml2Login(saml2 -> saml2
                .loginPage("/saml/login")
                .defaultSuccessUrl("/dashboard")
                .failureUrl("/login?error=saml")
                .userDetailsService(samlUserDetailsService())
            )
            .saml2Logout(Customizer.withDefaults());  // Single Logout support

        return http.build();
    }

    @Bean
    public RelyingPartyRegistrationRepository relyingPartyRegistrationRepository() {
        // Load IdP metadata from file (Azure AD Federation Metadata)
        RelyingPartyRegistration registration = RelyingPartyRegistrations
            .fromMetadataLocation("classpath:saml/idp-metadata.xml")
            .registrationId("azure-ad")
            // SP credentials (our signing certificate)
            .signingX509Credentials(c -> c.add(spSigningCredential()))
            // Our ACS URL (where IdP posts SAMLResponse)
            .assertionConsumerServiceLocation("{baseUrl}/login/saml2/sso/{registrationId}")
            .build();

        return new InMemoryRelyingPartyRegistrationRepository(registration);
    }

    @Bean
    public Saml2UserDetailsService samlUserDetailsService() {
        return (saml2Authentication) -> {
            // Extract attributes from SAML assertion
            Saml2AuthenticatedPrincipal principal =
                (Saml2AuthenticatedPrincipal) saml2Authentication.getPrincipal();

            String email = principal.getFirstAttribute("email");
            List<String> roles = principal.getAttribute("roles");

            // Map to your User entity
            return User.builder()
                .username(email)
                .authorities(roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList()))
                .build();
        };
    }

    private Saml2X509Credential spSigningCredential() {
        // Load your SP private key and certificate
        // Generated with: openssl req -new -x509 -days 3650 -key sp-private.key -out sp-cert.crt
        return Saml2X509Credential.signing(privateKey, certificate);
    }
}

// application.properties (alternative to Java config)
spring.security.saml2.relyingparty.registration.azure-ad.asserting-party.metadata-uri=\\
  https://login.microsoftonline.com/{tenant-id}/federationmetadata/2007-06/federationmetadata.xml
spring.security.saml2.relyingparty.registration.azure-ad.signing.credentials[0].private-key-location=\\
  classpath:saml/sp-private.key
spring.security.saml2.relyingparty.registration.azure-ad.signing.credentials[0].certificate-location=\\
  classpath:saml/sp-cert.crt`,
      followUp: [
        'What is Single Logout (SLO) in SAML?',
        'How do you handle SAML token expiry?',
        'What is the difference between SAML 2.0 and OAuth2 + OIDC? When would you choose each?',
      ],
      tip: 'The SP certificate/key pair is used to sign AuthnRequests (so IdP can verify it came from us) and to decrypt encrypted assertions from IdP. Keep private key safe — never in git.',
    },
    {
      id: 4,
      question: 'What is OAuth2 and how is it different from SAML? What is OpenID Connect?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['OAuth2', 'OIDC', 'JWT', 'SSO'],
      answer: `OAuth2 is an authorization framework — it answers "what can this app access on behalf of the user?" It gives tokens (access tokens) that grant access to resources.

SAML is an authentication protocol — it answers "who is this user?" and carries user identity via XML assertions.

Key differences:
- SAML: XML-based, enterprise-focused, verbose, great for web SSO
- OAuth2: JSON/REST-based, mobile/API friendly, lightweight, great for API access

OpenID Connect (OIDC) = OAuth2 + identity layer. It adds an ID token (JWT) containing user info on top of OAuth2's access token. This is what modern SSO mostly uses instead of SAML.

When to use which:
- SAML: legacy enterprise systems, AD FS, when IdP is older
- OAuth2 + OIDC: modern apps, mobile, API-to-API, when using Azure AD/Okta/Google in new projects

In new projects I'd always recommend OIDC over SAML — simpler, better mobile support, and all major IdPs support it.`,
      code: `// OAuth2 Authorization Code Flow (most common, web apps)
/*
  1. User clicks "Login with Google/Azure AD"
  2. App redirects to IdP: GET /authorize?
       client_id=my-app&
       response_type=code&
       redirect_uri=https://myapp.com/callback&
       scope=openid profile email&
       state=random-string (CSRF protection)

  3. User authenticates with IdP
  4. IdP redirects back: GET /callback?code=auth_code&state=...

  5. App exchanges code for tokens: POST /token
       grant_type=authorization_code&
       code=auth_code&
       redirect_uri=...&
       client_secret=...

  6. IdP returns:
     {
       "access_token": "eyJ...",  // use to call APIs
       "id_token": "eyJ...",      // user identity (JWT)
       "refresh_token": "...",    // get new access tokens
       "expires_in": 3600
     }
*/

// Spring Boot OAuth2 Login (OIDC with Azure AD)
@Configuration
@EnableWebSecurity
public class OAuthSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/dashboard")
                .userInfoEndpoint(info -> info
                    .oidcUserService(oidcUserService())
                )
            )
            .oauth2ResourceServer(rs -> rs
                .jwt(Customizer.withDefaults())  // validate JWT tokens for API calls
            );

        return http.build();
    }
}

# application.properties for Azure AD OIDC
spring.security.oauth2.client.registration.azure.client-id=\${AZURE_CLIENT_ID}
spring.security.oauth2.client.registration.azure.client-secret=\${AZURE_CLIENT_SECRET}
spring.security.oauth2.client.registration.azure.scope=openid,profile,email
spring.security.oauth2.client.provider.azure.issuer-uri=\\
  https://login.microsoftonline.com/{tenant-id}/v2.0`,
      followUp: [
        'What is a JWT? What are the three parts?',
        'What is the difference between access token and ID token?',
        'What is the PKCE flow? Why is it used for mobile apps?',
      ],
      tip: 'JWT = Header.Payload.Signature (base64). Access token = grants API access. ID token = contains user info (sub, email, name). They can look the same but serve different purposes.',
    },
    {
      id: 5,
      question: 'What are common SAML issues you faced in production? How did you debug them?',
      difficulty: 'advanced',
      asked: true,
      tags: ['SAML', 'Debugging', 'Production'],
      answer: `Great question — SAML issues in production are tricky because the assertion is XML and often base64 encoded. Here are the real issues I faced:

1. Clock skew: SAML assertions have NotBefore and NotOnOrAfter timestamps. If the SP server clock is more than 5 minutes behind the IdP, assertions are rejected as "expired" even though the user just authenticated. Fixed by syncing clocks (NTP).

2. Certificate mismatch: IdP or SP rotated certificates. Assertions signed with new cert but SP still had old cert in its metadata. Always test certificate rotation in staging first.

3. Attribute mapping wrong: The SAML attribute name from IdP (like "http://schemas.microsoft.com/identity/claims/displayname") didn't match what we configured in Spring. Debug by decoding the base64 SAMLResponse and inspecting the XML.

4. ACS URL mismatch: The AssertionConsumerServiceURL in the request didn't match what's registered in the IdP. IdP rejects the request. Fix: match exactly including http vs https.

5. Large assertions: Some IdPs include all group memberships in the assertion. For users with hundreds of groups, the assertion is huge and HTTP headers are too large. Fixed by filtering to only relevant groups.`,
      code: `// Debugging SAML issues:

// 1. Enable SAML debug logging
logging.level.org.springframework.security.saml2=TRACE
logging.level.org.opensaml=DEBUG

// 2. Decode a SAMLResponse manually (Java)
String samlResponse = request.getParameter("SAMLResponse");
byte[] decoded = Base64.getDecoder().decode(samlResponse);
String xml = new String(decoded, StandardCharsets.UTF_8);
System.out.println(xml);  // Read the raw assertion!

// 3. Online tools for SAML debugging:
// - SAML Tracer (Firefox/Chrome extension) — captures SAML messages
// - samltool.com — decode and analyze assertions
// - Fiddler / Charles Proxy

// 4. Common error messages and causes:
/*
  "InResponseTo attribute not matching" → session expired, user hit Back button
  "Assertion is not yet valid" → clock skew SP < IdP
  "Assertion has expired" → clock skew SP > IdP, or user waited too long
  "The issuer did not match" → wrong EntityID configured
  "Invalid signature" → wrong certificate in SP metadata
  "No RelyingPartyRegistration" → registrationId in URL doesn't match config
*/

// 5. Testing with a mock IdP (for development)
// Use: SimpleSAMLphp or keycloak in Docker
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \\
  quay.io/keycloak/keycloak:latest start-dev`,
      followUp: [
        'How do you test SAML in a local development environment?',
        'What is certificate rotation in SAML and how do you do it without downtime?',
      ],
      tip: 'Always install SAML Tracer browser extension before debugging SAML issues. It captures and decodes SAML messages in real-time — saves hours of debugging.',
    },
  ],
}

export default sso
