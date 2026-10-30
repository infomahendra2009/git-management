FROM mysql:8.4
COPY backup.sh /backup.sh
RUN sed -i 's/\r$//' /backup.sh
ENTRYPOINT ["sh", "/backup.sh"]
