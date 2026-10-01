package com.opsflow.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;
import java.util.UUID;

public class SecurityUtils {

    public static UUID getCurrentUserId() {
        return UUID.fromString(getAuth().getName());
    }

    @SuppressWarnings("unchecked")
    public static UUID getCurrentOrgId() {
        // ponytail: orgId stored by JwtAuthFilter — no JWT re-parse, no SpringContext
        Object details = getAuth().getDetails();
        if (details instanceof Map) {
            return UUID.fromString((String) ((Map<?, ?>) details).get("orgId"));
        }
        throw new IllegalStateException("orgId missing from security context — request not authenticated via JWT");
    }

    private static Authentication getAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}
