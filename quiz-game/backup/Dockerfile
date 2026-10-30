FROM mysql:8.4
RUN microdnf install -y tar gzip findutils && microdnf clean all
COPY backup.sh /backup.sh
ENTRYPOINT ["sh", "/backup.sh"]
